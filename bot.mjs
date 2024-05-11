import pkg from 'pg';
const {Pool} = pkg;
import * as fs from 'fs';
import dotenv from 'dotenv';
import cron from 'node-cron';
import fetch from 'node-fetch';

dotenv.config();
// Configuration de la connexion PostgreSQL
const pool = new Pool({
    user: process.env.USR_DATABASE,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432 // Port par défaut de PostgreSQL
});


// Remplacez 'XXXX' par votre token d'autorisation
const bearerToken = process.env.BEARER_TOKEN;

// En-tête avec le token d'autorisation
const headers = {
  'Authorization': `Bearer ${bearerToken}`
};

// Fonction pour obtenir les tweets d'un utilisateur donné

// Cette requête prend les 10 premiers messages, on peut donc lancer la requête tous les 2 jours par exemple par utilisateurs
async function getTweets(userId) {

  // Ajouter le paramètre tweet.fields pour spécifier les champs de tweet à inclure et exclure
  const tweetFields = 'public_metrics,referenced_tweets'; // Champs à inclure
  const url = `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=${tweetFields}&expansions=attachments.media_keys,referenced_tweets.id&media.fields=public_metrics&max_results=15`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: headers
  });
  const data = await response.json();
  return data;
}

// Fonction pour filtrer les tweets selon les mots-clés
function containsKeywords(text) {
  const keywords = ["PAC", "@pacmoon_", "pacmoon"];
  return keywords.some(keyword => text.includes(keyword));
}

// Fonction pour stocker les résultats dans un objet JSON
async function processTweets(userIds) {
  const results = [];

  // Définir la taille du lot pour le traitement des tweets
  const batchSize = 15; // Nombre d'utilisateurs à traiter dans chaque lot
  const totalBatches = Math.ceil(userIds.length / batchSize);

  // Parcourir les lots
  for (let i = 0; i < totalBatches; i++) {
    const batchStartIndex = i * batchSize;
    const batchEndIndex = Math.min((i + 1) * batchSize, userIds.length);
    const batchUserIds = userIds.slice(batchStartIndex, batchEndIndex);

    // Traiter les tweets pour le lot actuel
    const batchResults = await processBatchOfTweets(batchUserIds);
    results.push(...batchResults);

    //Si le nombre d'users est inférieur à 15 on peut exécuter les requêtes daily normalement
    if (userIds.length > 15) {
      // Sinon attendre un délai de 16 minutes entre chaque lot de 15 users max pour respecter les limites de taux
      await delay(16 * 60 * 1000); // Attendre 16 minutes entre chaque traitement de lot de 15 users pour éviter les erreurs Too Many Requests.
    }
  }

  return results;
}

// Fonction pour traiter un lot de tweets pour un ensemble d'utilisateurs
async function processBatchOfTweets(userIds) {
  const batchResults = [];

  // Parcourir les utilisateurs dans le lot actuel
  for (const userId of userIds) {
    try {
      const tweetData = await getTweets(userId);
      
      if (tweetData.data.status == 429) {
        console.error(`Trop de requêtes pour l'utilisateur ${userId}. Attendez un moment avant de réessayer.`);
        await delay(16 * 60 * 1000); // Attendre 16 minutes (16 * 60 * 1000 millisecondes)
        continue; // Passer à l'utilisateur suivant
    }
    

      const tweets = tweetData.data;
      const userTweets = tweets.map(tweet => {
        return {
          tweet_type: determineTweetType(tweet),
          text: tweet.text,
          contains_keywords: containsKeywords(tweet.text),
          public_metrics: tweet.public_metrics
        };
      });

      batchResults.push({
        user_id: userId,
        tweets: userTweets
      });
    } catch (error) {
      console.error(`Erreur lors du traitement de l'utilisateur ${userId}. Tweet data status : ${tweetData.data.status}`, error);
    }
  }

  return batchResults;
}

// Fonction pour attendre un certain délai
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function determineTweetType(tweet) {
  // Check for reply indicator
  if (tweet.referenced_tweets && tweet.referenced_tweets[0].type === "replied_to") {
      return "Reply Tweet";
  }
  // Check for quote tweet indicator
  else if (tweet.referenced_tweets && tweet.referenced_tweets[0].type === "quoted") {
      return "Quote Tweet";
  }
  // Check for retweet indicator
  else if (tweet.referenced_tweets && tweet.referenced_tweets[0].type === "retweeted") {
      return "Retweet";
  }
  else {
      return "Original Tweet";
  }
}



// Fonction pour afficher les résultats de manière détaillée
async function display(results) {
  try {
      console.log('Résultats :');
      results.forEach(user => {
          console.log(`User ID: ${user.user_id}`);
          console.log('Tweets :');
          user.tweets.forEach(tweet => {
              console.log('------------------------');
              console.log(`Type: ${tweet.tweet_type}`);
              console.log(`Text: ${tweet.text}`);
              console.log(`Contains Keywords: ${tweet.contains_keywords}`);
              console.log(`Public Metrics:`, tweet.public_metrics);
              console.log('------------------------');
          });
      });
  } catch (error) {
      console.error('Erreur lors de la récupération et de l\'affichage des résultats:', error);
  }
}

// Fonction pour insérer le score en base de données avec la date courante
async function insertScore(userIds, scores) {
  try {
    // Vérifier si les tableaux ont la même longueur
    if (userIds.length !== scores.length) {
      console.error('Les tableaux userIds et scores doivent avoir la même longueur.');
      return;
    }

    // Itérer sur les tableaux userIds et scores
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const score = scores[i];

      // Extrait le user_id sans guillemets
      const user_id = userId;

      // Insertion du score dans la table score_twitter
      const insertScoreQuery = {
        text: 'INSERT INTO score_twitter (user_id, score, date) VALUES ($1, $2, CURRENT_TIMESTAMP)',
        values: [user_id, score],
      };

      // Mise à jour de la colonne pac_fidelity dans la table user_access_tokens

      // Si on fait toujours le même score car on poste juste 1 ou 2 messages doit-on laisser la possibilité d'incrémenter l'unique score ?
      // Règle 1: Si une personne fait moins de 15 posts mais qu'ils n'ont plus aucune visibilité on n'incrémente plus le score, 
      //         cad si le score reste dans une marge de 20% avec l'ancien on n'incrémente pas car cela signifie que la personne ne tweet plus.
      // Règle 2: Si cette personne arrive néanmoins à atteindre du reach on augmente le score avec les anciens tweets. 
      
      // Récupérer l'ancien score
      const oldScoreQuery = {
        text: `
          SELECT score
          FROM score_twitter
          WHERE user_id = $1
          ORDER BY date DESC
          LIMIT 1 OFFSET 1
        `,
        values: [user_id],
      };

      // Exécuter la requête pour récupérer l'ancien score
      const oldScoreResult = await pool.query(oldScoreQuery);
      const oldScore = oldScoreResult.rows[0].score;

      // Mettre à jour pac_fidelity en fonction de la comparaison entre l'ancien score et $1
      const updateFidelityQuery = {
        text: `
          UPDATE user_access_tokens 
          SET pac_fidelity = 
            CASE 
              WHEN $2 < ($1 * 0.8) OR $2 > ($1 * 1.2) THEN pac_fidelity + $1
              ELSE pac_fidelity 
            END 
          WHERE user_id = $3;
        `,
        values: [score, oldScore, user_id],
      };  

      // Exécution de la première requête pour l'insertion dans la table score_twitter
      await pool.query(insertScoreQuery);
      console.log(`Score inséré en base de données avec succès pour l'utilisateur ${user_id}.`);

      // Exécution de la deuxième requête pour la mise à jour de la colonne pac_fidelity dans la table user_access_tokens
      await pool.query(updateFidelityQuery);
      console.log(`PAC fidelity mis à jour en base de données avec succès pour l'utilisateur ${user_id}.`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'insertion du score en base de données :', error);
  }
}



// Fonction pour calculer le score en fonction des résultats
function calculateScore(results) {

  let totalScore = [];
  results.forEach(user => {
    // Accéder à la propriété "user_id" de chaque objet utilisateur
    const userId = user.user_id;
    // Utiliser "userId" comme nécessaire
    console.log('User ID:', userId);
    let scoreTotalCourant = 0;
    // Si vous avez besoin de parcourir également les tweets de cet utilisateur
    const userTweets = user.tweets;
    userTweets.forEach(tweet => {
      // Accéder à chaque tweet et effectuer les opérations nécessaires
      //console.log('Tweet:', tweet);
      let score_tweet = 0;
      let coeff_type = 0;
      switch (tweet.tweet_type) {
        case "Reply Tweet":
          coeff_type = 0.1; // Définir une valeur pour les réponses
          break;
        case "Quote Tweet":
          coeff_type = 0.1; // Définir une valeur pour les citations
          break;
        case "Retweet":
          coeff_type = 0.2; // Définir une valeur pour les retweets
          break;
        case "Original Tweet":
          coeff_type = 1; // Définir une valeur pour les tweets originaux
          break;
        default:
          coeff_type = 0; // Valeur par défaut pour les types de tweet inconnus
      }
      let x1 = Math.sqrt(tweet.public_metrics.like_count);
      let x2 = tweet.public_metrics.retweet_count;
      let x3 = Math.sqrt(tweet.public_metrics.impression_count);

      // Appliquez une pénalité si le tweet ne contient pas de mots-clés Pacmoon
      score_tweet = coeff_type*(x1+x2+x3);
      if (!tweet.contains_keywords) {
        score_tweet /= 10; // Pénalité
      } 
      if (tweet.contains_keywords) {
        score_tweet *= 2; // Multiplicateur
      } 

      score_tweet = Math.ceil(score_tweet);
      console.log('Score du tweet courant :', score_tweet);
      scoreTotalCourant += score_tweet 
    });
    totalScore.push(scoreTotalCourant);
  });
  return totalScore;
}

// Fonction principale pour récupérer les résultats, calculer le score et insérer le score en base de données
async function processResultsAndInsertScore(userIds) {
  try {
    const results = await processTweets(userIds);
    const score = calculateScore(results);
    const currentDate = new Date();
    writeToLog("######################## " + currentDate + " ########################");
    writeToLog("User Ids : " + userIds);
    writeToLog("Score : " + score);
    await insertScore(userIds, score);
  } catch (error) {
    console.error('Erreur lors du traitement des résultats et de l\'insertion du score en base de données :', error);
  }
}

async function getUsersWithMetadataTrue() {
  try {
    // Exécutez la requête pour récupérer les user_ids avec metadata = TRUE
    const client = await pool.connect();

    try {
      const result = await client.query('SELECT user_id FROM user_access_tokens WHERE metadata_set = TRUE');

      // Extrait les user_ids de la réponse SQL
      const user_ids = result.rows.map(row => row.user_id);

      // Appeler la fonction pour calculer le score pour chaque utilisateurs
      if (user_ids.length > 0) {
        // Appeler la fonction pour traiter tous les utilisateurs
        await processResultsAndInsertScore(user_ids);
      }
    } finally {
      // Appelez la fonction pour update la rarity des PFP
      updateRarity();
      // Libère la connexion une fois que vous avez fini de l'utiliser
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des user_ids avec metadata = TRUE :', error);
  }
}


async function updateRarity() {
  const client = await pool.connect();
  try {
    // Étape 1 : Récupérer les données de user_access_tokens triées par pac_fidelity décroissant
    const userData = await client.query('SELECT username, pac_fidelity FROM user_access_tokens ORDER BY pac_fidelity DESC');

    // Étape 2 : Calculer la rareté et mettre à jour dans metadata en fonction du classement
    for (let i = 0; i < userData.rows.length; i++) {
      const user = userData.rows[i];
      const rarity = calculateRarity(i + 1, userData.rows.length);
      await client.query('UPDATE metadata SET rarity = $1 WHERE username = $2', [rarity, user.username]);
    }

    console.log('La mise à jour de la rareté a été effectuée avec succès.');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la rareté :', error);
  } finally {
    client.release();
  }
}

// Fonction pour calculer la rareté en fonction du classement
function calculateRarity(rank, totalUsers) {
  const percentile = (rank / totalUsers) * 100;
  if (percentile <= 5) {
    return 'Legendary';
  } else if (percentile <= 15 && percentile > 5) {
    return 'Epic';
  } else if (percentile <= 25 && percentile > 15) {
    return 'Rare';
  } else if (percentile <= 40 && percentile > 25) {
    return 'Uncommon';
  } else {
    return 'Common';
  }
}

// Fonction pour écrire dans un fichier de log
function writeToLog(data) {
  const logFilePath = 'log.txt';
  // Ajoutez une nouvelle ligne à la fin du fichier
  data += '\n';
  fs.appendFile(logFilePath, data, (err) => {
      if (err) {
          console.error('Erreur lors de l\'écriture dans le fichier de log :', err);
      }
  });
}

// Planifier l'exécution de la fonction une fois par jour à minuit
cron.schedule('0 0 * * *', () => {
    getUsersWithMetadataTrue();
});

// Appelez la fonction pour récupérer les user_ids avec metadata = TRUE et exécuter processResultsAndInsertScore
getUsersWithMetadataTrue();