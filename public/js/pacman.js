// Importer le fichier des fantômes
// Assurez-vous d'importer avant d'utiliser les fonctions des fantômes
// Ce script doit être inclus après le chargement du HTML, donc placé dans un fichier ou dans le balisage de la page.
import("./ghosts.js");

// Importer le fichier des fantômes
import { initializeGhosts, drawGhosts, handleGhostInteractions, handleBulletInteractions, moveGhosts, ghosts, playGhostEatBomb, displayExplosionAnimation, vibrateScreen } from "./ghosts.js";

import { verifyNubOwned } from "./metamask.js";

// Variables globales
let backgroundCanvas = document.getElementById("backgroundCanvas");
let gameCanvas = document.getElementById("gameCanvas");
let fullCanvas;
let backgroundCtx = backgroundCanvas.getContext("2d");
let gameCtx;
let pacmanX;
let pacmanY;
let pacmanSize = 20;
let pacmanSpeed = 7; // Vitesse de déplacement de Pacman
let color = "yellow"; // Couleur jaune de base de Pacman
let pacmanDirection = "right"; // Direction initiale de Pacman
let mouthAngle = 0.2; // Angle initial pour l'animation de bouche
let mouthIncrement = 0.05; // Contrôle l'incrémentation de l'angle de la bouche
let score = 0; // Définition et initialisation du score
let lastScore = 0;
let gameLoop; // Déclaration de la variable gameLoop
// Définir une variable pour garder une trace de l'état du bouton
let isGameOver = false;

let explosionTimeoutId = null; // id pour que la condition d'explosion ne se relance pas plusieurs fonctions

// gif pour relancer une partie
const startAgainImage = new Image();
startAgainImage.src = 'img/start.gif';

// On récupère l'id NUB sélectionné pour l'utilisateur courant en BDD
let nub_id = null; // default null
        
function setScore(score_) {
    score = score_;

}

function setPacmanSpeed(speed_) {
    pacmanSpeed = speed_;

}

function setColor(color_) {
    color = color_;

}

function setSize(size_) {
    pacmanSize = size_;

}

// vidéo d'introduction du jeu 
const video = document.getElementById('introductionVideo');
const videoContainer = document.getElementById('videoContainer');


// Lecture de la vidéo automatiquement au chargement de la page
video.addEventListener('play', function() {
    drawVideo();
});

// Fonction de lecture de vidéo
function drawVideo() {
    if (video.paused || video.ended) return;
    backgroundCtx.drawImage(video, 0, 0, backgroundCanvas.width, backgroundCanvas.height*0.8);
    requestAnimationFrame(drawVideo);
}

function handleVideoAfterClickButton() {

    video.play().catch(error => {
        console.error("Playback failed:", error);
        document.getElementById("playButton").style.display = "block";
    });

    //On masque le bouton Play par la suite
    document.getElementById("playButton").style.display = "none";
    videoContainer.addEventListener("click", handleClickStartGame);
    document.getElementById("playButton").removeEventListener("click", handleVideoAfterClickButton);

};

// On ajoute cet event au début
document.getElementById("playButton").addEventListener("click", handleVideoAfterClickButton);

//On affiche le bouton Play au début
//document.getElementById("playButton").style.display = "block";
// Masquer les contrôles de la vidéo
video.controls = false;




// Déclaration des variables
let isExploding = false;
let explosionSize = 0;
const maxExplosionSize = 50; // Taille maximale de l'explosion

// Fonction pour gérer l'explosion
function handleExplosion(ctx, x, y) {
    ctx.fillStyle = "orange"; // Couleur de l'explosion
    ctx.beginPath();
    ctx.arc(x, y, explosionSize, 0, 2 * Math.PI); // Dessin du cercle d'explosion
    ctx.closePath();
    ctx.fill();

    // Mettre à jour la taille de l'explosion
    explosionSize += 2; // Augmenter la taille de l'explosion

    // Réinitialiser l'explosion une fois la taille maximale atteinte
    if (explosionSize > maxExplosionSize) {
        isExploding = false; // Fin de l'explosion
        explosionSize = 0; // Réinitialiser la taille de l'explosion
    }
}



// Définition de la fonction gameOver
function gameOver() {
    isGameOver = true; // Mettre à jour l'état du jeu à "game over"
    // Autres actions à effectuer en cas de fin de jeu...

    // Gérer l'explosion si elle est en cours
    handleExplosion(gameCtx, pacmanX, pacmanY);
    resetGame();
    
    if (!localStorage.getItem('userAddress') || score == 0) {
        document.getElementById("transactionButton").style.display = "none";
        showGameOverModalNotLogged();
    } else {
        // Fenetre de partage
        document.getElementById("txHash").innerHTML = '';
        document.getElementById("infosUser").innerHTML = '';
        document.getElementById("transactionButton").disabled = false;
        document.getElementById("transactionButton").style.display = "block";
        document.getElementById("transactionButton").innerHTML = 'Claim PAC BOOM Points !';
        showGameOverModal(score);
    }


    // Désactiver le gestionnaire d'événements sur le bouton "Start Game"
    document.getElementById("backgroundCanvas").removeEventListener("click", startGame);
    isRunning = false;
    updateScore(0);

    // Réactiver le gestionnaire d'événements sur "Start Game"
    gameCanvas.style.display = "none";
    backgroundCtx.drawImage(startAgainImage, 0, 0, backgroundCanvas.width, backgroundCanvas.height*0.8);
    videoContainer.style.display = "block";

    // On ajoute l'evenement de click une fois qu'on a cliqué sur le bouton playButton
    document.getElementById("playButton").addEventListener("click", handleVideoAfterClickButton);

    videoContainer.addEventListener("click", handleClickStartGame);

}


// Fonction pour effacer la vidéo du canvas et la cacher
function clearVideo() {
    // Arrêter la vidéo si elle est en train de jouer
    if (!video.paused) {
        video.pause();
    }

    // Effacer le contenu du canvas
    backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    // Cacher visuellement la vidéo en modifiant les styles CSS
    videoContainer.style.display = "none";
}

let isRunning = false;

// Fonction pour initialiser le jeu
function startGame() {
    if (!isRunning) {
        isRunning = true;
        // Récupérer les références des canvas et des contextes
        backgroundCanvas = document.getElementById("backgroundCanvas");
        gameCanvas = document.getElementById("gameCanvas");
        fullCanvas = document.getElementById("canvasContainer");
        backgroundCtx = backgroundCanvas.getContext("2d");
        gameCtx = gameCanvas.getContext("2d");
        document.getElementById("transactionButton").disabled = true;

        // Désactiver l'event click sur videoContainer
        videoContainer.removeEventListener("click", handleClickStartGame);
        // On efface la vidéo d'intro quand on lance le jeu !
        clearVideo();

        gameCtx.clearRect(0, 0, 500, 500);

        // Initialiser la position de Pacman au centre du canvas de jeu
        pacmanX = gameCanvas.width / 2;
        pacmanY = gameCanvas.height / 2;


        // On début de la partie on récupère le nub_id dans le serveur pour la personne x
        const jwtToken = localStorage.getItem('jwtToken'); // Récupérer le JWT depuis localStorage
        
        // Récupérer les métadonnées de l'utilisateur depuis le serveur
        fetch('/getNub', {
            method: 'POST',
            headers: {
                'Authorization': `${jwtToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                if (response.status === 204) {
                    // Aucune donnée n'est présente, vous pouvez gérer cela comme nécessaire
                    console.log('No nub selected.');
                    return null; // Ou toute autre action que vous souhaitez prendre
                } else {
                    // Il y a des données dans la réponse, vous pouvez la traiter comme d'habitude
                    return response.json();
                }
            } else {
                //throw new Error('Error retrieving metadata');
            }
        })
        .then(metadata => {
            // Mettre à jour l'interface utilisateur avec les métadonnées récupérées
            
            if (metadata[0].nub_id != null) {

                nub_id = metadata[0].nub_id % 16; // stocker l'id du nub dans la variable nub_id pour la suite du traitement
                // !!! faire un modulo 16 pour travailler avec les images des nubs présentes sur le serveur !!!!
                
            } else {
                // Aucune métadonnée n'a été récupérée, afficher un message ou effectuer une action appropriée
                nub_id = null;
            }

        })
        .catch(error => {
            console.error('Error retrieving nub:', error);
            // Si pas de login et pas de nub on affiche pacman en jaune avec un nub_id null
            drawPacman("yellow", null);
        });

        // On vérifie si le nub enregistré en bdd est bien possédé, sinon on réattribue la valeur null au nub_id
        /*verifyNubOwned(nub_id).then(isOwned => {
            if (!isOwned) {
                nub_id = null;

                fetch('/saveNub', {
                    method: 'POST',
                    headers: {
                        'Authorization': `${jwtToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nub_id : null })
                })
                .then(response => {
                    if (response.ok) {
                        // La requête s'est déroulée avec succès (metadata enregistrée ou mises à jour)
                        return response.json();
                    } else if (response.status === 500) {
                        // On continue malgré tout pour mettre à jour l'interface utilisateur
                        return Promise.resolve({ nub_id }); // Simuler une réponse avec les données de l'utilisateur existant
                    } else {
                        throw new Error('Erreur serveur');
                    }
                })
                .then(result => {
                    console.log('Nub Metadata saved into database');
                })
                .catch(error => {
                    console.error("Error during saving of nub metadata !", error);
                });
            }
        });*/


        // Initialisation des fantômes
        initializeGhosts(gameCtx, gameCanvas.width, gameCanvas.height);
       
        // On remet le score à zéro
        fetch('/initialize-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${localStorage.getItem("jwtToken")}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to initialize score');
            }
            return response.json();
        })
        .then(data => {
            score = data.score; // Affecte la valeur du score initialisé à zéro à la variable score
        })
        .catch(error => {
            console.error('Erreur lors de l\'initialisation du score:', error);
        });
        // Démarrer la boucle de jeu
        gameLoop = setInterval(() => updateGame(nub_id), 50); // Appeler updateGame toutes les 50 ms (augmentation de la vitesse)
        if (!explosionTimeoutId) {
            setInterval(drawScore, 50);
        }
    }
}

// Variables globales pour l'animation de l'ellipse
let ellipseRadiusX = 12 / 20 * pacmanSize; // Rayon initial de l'axe x de l'ellipse
let ellipseRadiusY = 8 / 20 * pacmanSize;  // Rayon initial de l'axe y de l'ellipse
let ellipseGrowing = true; // Indicateur pour savoir si l'ellipse grandit ou rétrécit

// Image qui affichera le nub sélectionné
const img = new Image();

// Dessiner Pacman sur le canvas avec animation de bouche
function drawPacman(color, nub_id) {
    // Calculer les angles de début et de fin pour l'animation de bouche
    let startAngle, endAngle;

    switch (pacmanDirection) {
        case "right":
            startAngle = mouthAngle;
            endAngle = 2 * Math.PI - mouthAngle;
            break;
        case "left":
            startAngle = Math.PI + mouthAngle;
            endAngle = Math.PI - mouthAngle;
            break;
        case "up":
            startAngle = 3 / 2 * Math.PI + mouthAngle;
            endAngle = 3 / 2 * Math.PI - mouthAngle;
            break;
        case "down":
            startAngle = 1 / 2 * Math.PI + mouthAngle;
            endAngle = 1 / 2 * Math.PI - mouthAngle;
            break;
        default:
            break;
    }

    if (nub_id == null) {
        gameCtx.fillStyle = color;
        gameCtx.beginPath();
        gameCtx.arc(Math.floor(pacmanX), Math.floor(pacmanY), pacmanSize, startAngle, endAngle);
        gameCtx.lineTo(Math.floor(pacmanX), Math.floor(pacmanY));
        gameCtx.closePath();
        gameCtx.fill();

        mouthAngle += mouthIncrement;
        if (mouthAngle >= 0.8 || mouthAngle <= 0.2) {
            mouthIncrement = -mouthIncrement;
        }
        
    } else if (nub_id != null) { 

        img.src = '../img/nub/' + nub_id % 16 + '.png';

        gameCtx.save();
        gameCtx.translate(Math.floor(pacmanX), Math.floor(pacmanY));

        switch (pacmanDirection) {
            case "right":
                gameCtx.rotate(-Math.PI / 2);
                break;
            case "left":
                gameCtx.rotate(Math.PI / 2);
                break;
            case "up":
                gameCtx.rotate(Math.PI);
                break;
            case "down":
                gameCtx.rotate(0);
                break;
            default:
                break;
        }

        gameCtx.drawImage(img, -pacmanSize * 2.5, -pacmanSize * 2.5, pacmanSize * 5, pacmanSize * 5);

        gameCtx.fillStyle = 'black';
        gameCtx.beginPath();
        gameCtx.ellipse(0, 0, ellipseRadiusX, ellipseRadiusY, 0, 0, 2 * Math.PI);
        gameCtx.closePath();
        gameCtx.fill();

        gameCtx.restore();

        // Mise à jour de la taille de l'ellipse pour l'animation
        if (ellipseGrowing) {
            ellipseRadiusX += 1 / 50 * pacmanSize;
            ellipseRadiusY += 1 / 50 * pacmanSize;
            if (ellipseRadiusX >= 12 / 20 * pacmanSize || ellipseRadiusY >= 8 / 20 * pacmanSize) {
                ellipseGrowing = false;
            }
        } else {
            ellipseRadiusX -= 1 / 50 * pacmanSize;
            ellipseRadiusY -= 1 / 50 * pacmanSize;
            if (ellipseRadiusX <= 2 / 20 * pacmanSize || ellipseRadiusY <= 2 / 20 * pacmanSize) {
                ellipseGrowing = true;
            }
        }
    } 
}


// Variable globale pour stocker l'état de la touche "SPACE"
let isSpacePressed = false;

// Variables pour contrôler le tir
let lastShotTime = 0;
let shotCooldown = 3000; // 3 secondes en millisecondes
let cooldownProgress = 0; // Progression du cooldown en pourcentage (0 à 100)
let isPacmanStopped = false; // Indique si Pacman est arrêté


// Fonction pour gérer les événements clavier
function handleKeyPress(event) {
    // Récupérer le code de la touche pressée
    const key = event.key;

    // Empêcher le comportement par défaut (défilement de la fenêtre)
    if (key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
    }

    if (key === ' ') { // Touche Espace (Space)
        if (event.type === 'keydown') {

            event.preventDefault(); // Empêche le comportement par défaut de la touche "SPACE" (par exemple, défilement de la page)

            // Vérifie si le jeu est en cours et que ce n'est pas en game over
            if (isRunning && !isGameOver) {

                if (nub_id != null && nub_id >= 9) { //supérieur ou égal à 9 car l'id 9 à 15 sont les nub avec une arme !
                    // Si nub_id est différent de null et supérieur ou égal à 9 , Pacman tire une balle au lieu d'accélérer
                    let currentTime = Date.now();
                    if (currentTime - lastShotTime >= shotCooldown) {
                        lastShotTime = currentTime;
                        playMusicShoot(); // Jouer la musique
                        stopPacmanAndShoot();
                    }

                } else {
                    isSpacePressed = true; // Accélère Pacman si nub_id est null
                    playMusic(); // Jouer la musique
                }

            }

        } else if (event.type === 'keyup') {

            if (isRunning && !isGameOver) {
                isSpacePressed = false; // Marque la touche "SPACE" comme relâchée
                stopMusic(); // Arrêter la musique lorsque la touche est relâchée
            }
        }
    }
}


// Fonction pour déplacer Pacman en fonction de la direction et de la vitesse
function movePacman() {

    if (isPacmanStopped) {
        return; // Ne pas bouger Pacman si isPacmanStopped est true
    }

    let speedFactor = isSpacePressed ? 2 : 1; // Facteur de vitesse (x2 si "SPACE" est enfoncée, sinon x1)
  
    switch (pacmanDirection) {
        case "right":
            if (pacmanX + pacmanSize + pacmanSpeed * speedFactor <= gameCanvas.width) {
                pacmanX += pacmanSpeed * speedFactor;
            }
            break;
        case "left":
            if (pacmanX - pacmanSpeed * speedFactor >= 0) {
                pacmanX -= pacmanSpeed * speedFactor;
            }
            break;
        case "down":
            if (pacmanY + pacmanSize + pacmanSpeed * speedFactor <= gameCanvas.height) {
                pacmanY += pacmanSpeed * speedFactor;
            }
            break;
        case "up":
            if (pacmanY - pacmanSpeed * speedFactor >= 0) {
                pacmanY -= pacmanSpeed * speedFactor;
            }
            break;
        default:
            break;
    }
}


// Créer un nouvel élément audio
const audioShoot = new Audio("sound/pacman_shoot.mp3");

// Fonction pour jouer la musique
function playMusicShoot() {
    audioShoot.loop = false; // Jouer en boucle
    audioShoot.play(); // Jouer la musique
}


// Créer un nouvel élément audio
const audio = new Audio("sound/pacman_extrapac.wav");

// Fonction pour jouer la musique
function playMusic() {
    audio.loop = true; // Jouer en boucle
    audio.play(); // Jouer la musique
}

// Fonction pour arrêter la musique
function stopMusic() {
    audio.pause(); // Mettre en pause la musique
    audio.currentTime = 0; // Revenir au début de la piste
}

// Écouter les événements clavier sur la fenêtre
window.addEventListener('keydown', handleKeyPress);
window.addEventListener('keyup', handleKeyPress);

let thresholdExplode = false;
var maxScore = 8000; // Max score pour barre power
var energyBarWidth = 0; 
var lastEnergyBarWidth = 0; 
var energyBarColor;

function drawScore() {

    // Dessiner le score
    gameCtx.fillStyle = "white";
    gameCtx.font = "16px Arial";
    gameCtx.fillText("Score: " + score, 20, 30);

    // Dessiner "Boom :"
    gameCtx.fillText("Boom :", 20, 55);


    // Calculer la largeur de la barre d'énergie basée sur le score par rapport à maxScore
    lastEnergyBarWidth = (lastScore % maxScore / maxScore) * 50;
    energyBarWidth = (score % maxScore / maxScore) * 50;
    
    // Vérifier si la différence de largeur dépasse un seuil pour déclencher l'explosion
    if (energyBarWidth - lastEnergyBarWidth < 0) {
        thresholdExplode = true;
    } else {
        thresholdExplode = false;
    }

    // Définir la couleur de la barre d'énergie
    energyBarColor = "green";

    if (energyBarWidth > 40 && energyBarWidth < 50) {
        energyBarColor = "red";
        var amplitude = 4; // Amplitude de la vibration
        var frequency = 0.1; // Fréquence de la vibration
        var time = Date.now() * frequency;
        var vibration = Math.sin(time) * amplitude;
        // Dessiner la barre d'énergie avec une vibration
        gameCtx.clearRect(75, 45, 50, 10);
        gameCtx.fillStyle = energyBarColor;
        gameCtx.fillRect(75 + vibration, 45, 50, 10);
    }

    // Si le seuil d'explosion est atteint et aucune explosion en cours
    if (thresholdExplode && !explosionTimeoutId && score > 0) {
        // Déclencher l'explosion
        explosionTimeoutId = Math.random();
        playGhostEatBomb();
        displayExplosionAnimation(pacmanX, pacmanY, gameCtx);
        vibrateScreen();
        // Ajouter la classe de flash pour déclencher l'animation CSS
        document.body.classList.add('flash-effect');
        // Retirer la classe après l'animation pour réinitialiser l'effet
        setTimeout(function() {
            document.body.classList.remove('flash-effect');
        }, 500); // Durée de l'animation en millisecondes
            
        // Réinitialisation des fantômes
        initializeGhosts(gameCtx, gameCanvas.width, gameCanvas.height, pacmanX, pacmanY, pacmanSize);
        updateScore(score);
    } 

    // Dessiner la barre d'énergie vide avec un contour blanc
    //gameCtx.fillStyle = "white";
    gameCtx.fillRect(75, 45, 50, 10); // Dessiner la barre d'énergie vide
    //gameCtx.strokeStyle = "white";
    //gameCtx.strokeRect(75, 45, 50, 10); // Dessiner le contour blanc

    gameCtx.fillStyle = energyBarColor;
    gameCtx.fillRect(75, 45, energyBarWidth, 10); // Dessiner la barre d'énergie
    explosionTimeoutId = null;
    
}




// Fonction pour mettre à jour le score
function updateScore(points) {
    lastScore = score;
    score = points;
}



// Mettre à jour le jeu à chaque frame
function updateGame(nub_id) {
    clearGameCanvas(); // Effacer seulement le canvas de jeu
    movePacman();
    moveGhosts(gameCanvas.width, gameCanvas.height); // Appeler moveGhosts avec les dimensions du canvas
    
    // Appel de la fonction de gestion des interactions avec les fantômes
    handleGhostInteractions(gameCtx, pacmanX, pacmanY, pacmanSize, pacmanDirection, updateScore, score, gameOver, resetGame, setPacmanSpeed, setColor, setSize);   
    
    drawGhosts(gameCtx); // Appel de la fonction de dessin des fantômes
    //drawScore();
    drawPacman(color, nub_id);

    if (nub_id >= 9) {
        // Appel de la fonction de gestion des interactions entre balles et fantômes
        handleBulletInteractions(gameCtx, bullets, updateScore, pacmanX, pacmanY, pacmanSize);    
        
        // Dessine le cercle de cooldown en dernier pour qu'il soit affiché au-dessus de pacman
        drawCooldownCircle(nub_id); //ne pas l'afficher si nub_id est null 

        // Met à jour la progression du cooldown
        updateCooldown();

        // Gérer les balles
        moveBullets(); // Déplacer les balles
        drawBullets(); // Dessiner les balles
    }



}



// Effacer seulement le canvas de jeu
function clearGameCanvas() {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
}

// Gérer les touches du clavier
document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowRight":
            pacmanDirection = "right";
            break;
        case "ArrowLeft":
            pacmanDirection = "left";
            break;
        case "ArrowDown":
            pacmanDirection = "down";
            break;
        case "ArrowUp":
            pacmanDirection = "up";
            break;
        default:
            break;
    }
});

// Fonction pour réinitialiser le jeu
function resetGame() {
    clearInterval(gameLoop); // Arrêter la boucle de jeu
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height); // Effacer seulement le canvas de jeu
    pacmanX = gameCanvas.width / 2; // Réinitialiser la position X de Pacman
    pacmanY = gameCanvas.height / 2; // Réinitialiser la position Y de Pacman
    mouthAngle = 0.2; // Réinitialiser l'angle de la bouche de Pacman
    mouthIncrement = 0.05; // Réinitialiser l'incrémentation de l'angle de la bouche
    setSize(20);
    setColor("yellow");
    stopMusic();
    //On remet à zéro tout ce qui concerne le mode tactile

    if (isSmartphone) {
        unblockPageScroll(); // Débloque le défilement de la page

        // Gestionnaire d'événement pour touchstart (au début du toucher)
        document.removeEventListener("touchstart", handleTouchStart);

        // Gestionnaire d'événement pour touchmove (mouvement du toucher)
        document.removeEventListener("touchmove", handleTouchMove, { passive: false });

        // Gestionnaire d'événement pour touchend (fin du toucher)
        document.removeEventListener("touchend", handleTouchEnd);
    }
    isSpacePressed = false;
    isMusicPlaying = false;
    initialX = null;
    initialY = null;

    isGameOver = false; // Réinitialiser l'état du jeu à "non game over"

}



// Vérifier si la largeur de l'écran est inférieure à une certaine valeur (typiquement une largeur de smartphone)
const isSmartphone = window.innerWidth < 768; // Vous pouvez ajuster cette valeur selon vos besoins



// Gérer le clic sur le bouton
function handleClickStartGame() {

    //Rafficher le canvas du jeu avec tous les éléments
    gameCanvas.style.display = "block";
    // Démarrer le jeu ou effectuer d'autres actions ici...
    startGame();

    // Attacher les gestionnaires d'événements tactiles uniquement si c'est un smartphone
    if (isSmartphone) {
        blockPageScroll(); // Bloque le défilement de la page

        // Gestionnaire d'événement pour touchstart (au début du toucher)
        document.addEventListener("touchstart", handleTouchStart);

        // Gestionnaire d'événement pour touchmove (mouvement du toucher)
        document.addEventListener("touchmove", handleTouchMove, { passive: true });

        // Gestionnaire d'événement pour touchend (fin du toucher)
        document.addEventListener("touchend", handleTouchEnd);
    }

    // On enlève l'event handleClickStartGame pour ne pas avoir à recliquer plusieurs fois
    videoContainer.removeEventListener("click", handleClickStartGame);

}



// Variable pour stocker les coordonnées initiales du toucher
let initialX = null;
let initialY = null;
let isMusicPlaying = false; // Variable de contrôle pour vérifier si la musique est en cours de lecture

let touchStartTime = null; // Temps du début du toucher
const tapThreshold = 200; // Délai en millisecondes pour distinguer un tap
const moveThreshold = 10; // Distance minimale en pixels pour distinguer un tap d'un glissement

let touchTimeout = null;
const minimumPressDuration = 150; // Durée minimale en millisecondes


function handleTouchStart(event) {
    if (nub_id >= 9) {
        initialX = event.touches[0].clientX;
        initialY = event.touches[0].clientY;
        touchStartTime = Date.now(); // Enregistrer le temps du début du toucher

    } else {

        initialX = event.touches[0].clientX;
        initialY = event.touches[0].clientY;
        touchStartTime = Date.now(); // Enregistrer le temps du début du toucher

        // Démarrer un timeout pour vérifier la durée du toucher
        touchTimeout = setTimeout(() => {
            if (!isMusicPlaying) {
                // Accélérer le mouvement de Pacman si le toucher dure au moins 100 ms
                isSpacePressed = true;
                playMusic();
                isMusicPlaying = true; // Mettre à jour la variable de contrôle
            }
        }, minimumPressDuration);
    }
}


// Gestionnaire pour le mouvement tactile
function handleTouchMove(event) {
    if (!initialX || !initialY) {
        return;
    }

    // Récupérer les coordonnées du mouvement actuel du doigt
    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;

    // Calculer la différence entre les coordonnées initiales et actuelles
    const deltaX = currentX - initialX;
    const deltaY = currentY - initialY;

    if (nub_id >= 9) {
        // Vérifier si le mouvement dépasse le seuil pour être considéré comme un glissement
        if (Math.abs(deltaX) > moveThreshold || Math.abs(deltaY) > moveThreshold) {
            // Déterminer la direction en fonction du mouvement horizontal et vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    pacmanDirection = "right";
                } else {
                    pacmanDirection = "left";
                }
            } else {
                if (deltaY > 0) {
                    pacmanDirection = "down";
                } else {
                    pacmanDirection = "up";
                }
            }

            touchStartTime = null;
        } 
    } else {
        // Déterminer la direction en fonction du mouvement horizontal et vertical
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                pacmanDirection = "right";
            } else {
                pacmanDirection = "left";
            }
        } else {
            if (deltaY > 0) {
                pacmanDirection = "down";
            } else {
                pacmanDirection = "up";
            }
        }
    }

    // Réinitialiser les coordonnées du toucher initial pour le prochain mouvement
    initialX = null;
    initialY = null;
}


function handleTouchEnd(event) {
    
    // Si l'utilisateur lève le doigt avant 100 ms, annuler le timeout
    clearTimeout(touchTimeout);
    if (nub_id >= 9) {
        if (!touchStartTime) return;

        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;

        // Si la durée du toucher est inférieure au seuil et que le mouvement est faible, c'est un tap
        if (touchDuration < tapThreshold) {
            // Si nub_id est différent de null et supérieur ou égal à 9, Pacman tire une balle au lieu d'accélérer
            if (window.innerWidth <= 768 && nub_id != null) {
                // Vérifier si le toucher est à l'intérieur du cercle
                let currentTime = Date.now();
                if (currentTime - lastShotTime >= shotCooldown) {
                    lastShotTime = currentTime;
                    playMusicShoot(); // Jouer la musique
                    stopPacmanAndShoot();
                }
            }
        }
        // Réinitialiser les coordonnées du toucher initial
        initialX = null;
        initialY = null;
        touchStartTime = null;
    } else {
        // Réinitialiser les coordonnées du toucher initial
        initialX = null;
        initialY = null;

        // Arrêt de la musique et de la vitesse élevée pour Pacman si nub_id == null
        if (isMusicPlaying) {
            // Arrêter d'accélérer le mouvement de Pacman
            isSpacePressed = false;
            // Arrêter de jouer la musique
            stopMusic();
            isMusicPlaying = false; // Mettre à jour la variable de contrôle
        }
    }
}


// Fonction pour bloquer le défilement de la page
function blockPageScroll() {
    document.body.classList.add('no-scroll'); // Ajoute la classe 'no-scroll' au corps
}

// Fonction pour débloquer le défilement de la page
function unblockPageScroll() {
    document.body.classList.remove('no-scroll'); // Supprime la classe 'no-scroll' du corps
}

// Empêcher la sélection de texte sur le canvas
document.getElementById("gameCanvas").addEventListener("selectstart", function(event) {
    event.preventDefault();
});

// Empêcher la sélection de texte sur le canvas
document.getElementById("backgroundCanvas").addEventListener("selectstart", function(event) {
    event.preventDefault();
});


// Fonction pour arrêter Pacman et tirer une balle
function stopPacmanAndShoot() {
    if (cooldownProgress >= 100) {
        // Réinitialise le cooldown
        lastShotTime = Date.now();
        cooldownProgress = 0;

        // Arrête Pacman
        isPacmanStopped = true;

        // Tirer une balle
        shootBullet();

        // Remet Pacman en mouvement après un court délai (par exemple 1 seconde)
        setTimeout(function() {
            isPacmanStopped = false;
        }, 500); // Pacman s'arrête pendant 0.5 seconde avant de reprendre son mouvement
    }
}


let bullets = []; // Array pour stocker les balles

// Fonction pour tirer une balle
function shootBullet() {
    // Créer une nouvelle balle en fonction de la position actuelle et de la direction de Pacman
    const bullet = {
        x: pacmanX,
        y: pacmanY,
        direction: pacmanDirection,
        speed: 7 * 4, // La vitesse de la balle peut être plus rapide que Pacman
        size: 5
    };

    // Ajouter la balle à la liste des balles
    bullets.push(bullet);
}


function moveBullets() {
    bullets.forEach((bullet, index) => {
        // Mettre à jour la position de la balle en fonction de sa direction
        switch (bullet.direction) {
            case "right":
                bullet.x += bullet.speed;
                break;
            case "left":
                bullet.x -= bullet.speed;
                break;
            case "up":
                bullet.y -= bullet.speed;
                break;
            case "down":
                bullet.y += bullet.speed;
                break;
            default:
                break;
        }

        // Supprimer la balle si elle sort du cadre
        if (bullet.x < 0 || bullet.x > gameCanvas.width || bullet.y < 0 || bullet.y > gameCanvas.height) {
            bullets.splice(index, 1);
        }
    });
}

function drawBullets() {
    bullets.forEach((bullet) => {
        gameCtx.fillStyle = "grey"; // Couleur de la munition
        gameCtx.beginPath();

        // Dessiner la base de la munition (un rectangle)
        let baseWidth = bullet.size * 1.2; // Largeur de la base
        let baseHeight = bullet.size * 0.6; // Hauteur de la base
        gameCtx.rect(bullet.x - baseWidth / 2, bullet.y - baseHeight / 2, baseWidth, baseHeight);

        // Dessiner la tête de la munition (un demi-cercle)
        gameCtx.arc(bullet.x, bullet.y - baseHeight / 2, baseWidth / 2, 0, Math.PI, true);
        
        gameCtx.fill();
        gameCtx.closePath();
    });
}


// Fonction pour mettre à jour la progression du cooldown
function updateCooldown() {
    let currentTime = Date.now();
    if (currentTime - lastShotTime < shotCooldown) {
        cooldownProgress = (currentTime - lastShotTime) / shotCooldown * 100;
    } else {
        cooldownProgress = 100; // Prêt à tirer
    }
}

// Fonction pour dessiner le cercle de cooldown
function drawCooldownCircle(nub_id) {

    // Ne pas dessiner le cercle si nub_id est null
    if (nub_id == null) {
        return;
    }
    
    let centerX = gameCanvas.width - 20; // Position X du cercle (coin supérieur droit)
    let centerY = 40; // Position Y du cercle
    let radius = 20; // Rayon du cercle

    // Dessine le cercle de fond
    gameCtx.beginPath();
    gameCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    gameCtx.fillStyle = "#ccc"; // Couleur de fond du cercle
    gameCtx.fill();
    gameCtx.closePath();

    // Dessine le cercle de progression
    gameCtx.beginPath();
    let endAngle = -0.5 * Math.PI + (2 * Math.PI * (cooldownProgress / 100));
    gameCtx.arc(centerX, centerY, radius, -0.5 * Math.PI, endAngle);
    gameCtx.lineTo(centerX, centerY); // Ligne vers le centre
    gameCtx.fillStyle = "#FFA500"; // Couleur de la progression (orange)
    gameCtx.fill();
    gameCtx.closePath();

    // Si le cooldown est terminé, affiche "Shoot!" au centre du cercle
    if (cooldownProgress >= 100) {
        gameCtx.font = "bold 10px Arial";
        gameCtx.fillStyle = "#ffffff"; // Couleur du texte
        gameCtx.fillText("Shoot!", centerX - 16, centerY + 2);
    }
}

