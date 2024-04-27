const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let lives = 3;
let characters = [];


// Fonction pour afficher l'animation d'explosion
function displayExplosionAnimation(mouseX, mouseY, gameCtx) {
    const explosionImage = new Image();
    explosionImage.src = './img/boom.gif'; 

    // Attendre le chargement de l'image avant de l'afficher
    explosionImage.onload = () => {
        // Récupérer les dimensions de l'image de l'explosion
        const explosionWidth = explosionImage.width;
        const explosionHeight = explosionImage.height;

        // Calculer les coordonnées pour centrer l'explosion sur la souris
        const explosionX = mouseX - explosionWidth / 2;
        const explosionY = mouseY - explosionHeight / 2;

        // Dessiner l'image de l'explosion centrée sur la souris
        gameCtx.drawImage(explosionImage, explosionX, explosionY);

        // Attendre la durée totale de l'explosion avant de nettoyer le canvas
        const explosionDuration = 1000; // Durée en millisecondes de l'explosion (ajustez selon votre GIF)
        setTimeout(() => {
            // Nettoyer le canvas ou effectuer d'autres actions
            gameCtx.clearRect(0, 0, gameCtx.canvas.width, gameCtx.canvas.height);
            // Autres actions à effectuer après l'explosion...
        }, explosionDuration);
    };
}



function vibrateScreen() {
    // Vérifier si le navigateur supporte l'API de vibration
    if (navigator.vibrate) {
        // Faire vibrer l'écran pendant 200 millisecondes
        navigator.vibrate(200);
    } else {
        console.log("L'API de vibration n'est pas prise en charge dans ce navigateur.");
    }
}


function drawCharacter(image, x, y) {
    ctx.drawImage(image, x, y, 50, 50); // Modifier la taille en fonction de vos besoins
}

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
}

function updateLives() {
    lives--;
    document.getElementById('lives').textContent = lives;
    if (lives <= 0) {
        // Game over  
        // Fenetre de partage du score
        showGameOverModal(score);
    
    
        // Réinitialiser le jeu
        score = 0;
        lives = 3;
        characters = [];
        document.getElementById('score').textContent = score;
        document.getElementById('lives').textContent = lives;

        
    }
}

// Générer un personnage en fonction du score
let spawnInterval = 2000; // Interval initial de génération de personnages (2 secondes)
let minSpawnInterval = 500; // Interval minimum de génération de personnages (0.5 seconde)
let spawnRateDecrease = 100; // Nombre de millisecondes à retirer à l'intervalle de génération à chaque nouveau personnage

// Générer un personnage
function spawnCharacter() {
    const maxCharacters = 5; // Limite de personnages générés aléatoirement
    
    // Durée de vie du personnage en fonction du score (plus le score est élevé, plus la durée de vie est courte)
    const characterLifetime = Math.max(60, 180 - Math.floor(score / 10)); // Durée de vie initiale de 3 secondes (180 frames) avec un minimum de 1 seconde (60 frames)
    
    // Limiter le nombre de personnages générés aléatoirement
    for (let i = 0; i < Math.min(maxCharacters, 1 + Math.floor(score / 500)); i++) {
        let characterType = Math.random()< 0.5 ? 'pacmoon' : 'ghost';

        let characterImage = new Image();
        characterImage.src = characterType === 'pacmoon' ? './img/pacmoon.png' : './img/ghost.png'; // Modifier les chemins d'accès en fonction de vos images
        const characterX = Math.random() * (canvas.width - 50); // Position aléatoire en x
        const characterY = Math.random() * (canvas.height - 50); // Position aléatoire en y
        characters.push({ type: characterType, image: characterImage, x: characterX, y: characterY, timeVisible: characterLifetime, clicked: false }); // Assurez-vous de définir la propriété "clicked" à false pour chaque nouveau personnage
        setTimeout(1000);
    }
    
    // Diminuer l'intervalle de génération pour afficher plus de personnages
    if (spawnInterval > minSpawnInterval) {
        spawnInterval -= spawnRateDecrease;
    }
}


// Générer un personnage toutes les "spawnInterval" millisecondes
setInterval(spawnCharacter, spawnInterval);

// Ajoutez un gestionnaire d'événements de clic au canvas
canvas.addEventListener('click', function(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    // Parcourez tous les personnages pour vérifier s'ils ont été cliqués
    characters.forEach(character => {
        // Vérifiez si les coordonnées du clic se trouvent à l'intérieur de la zone occupée par le personnage
        if (
            mouseX >= character.x &&
            mouseX <= character.x + 50 && // Largeur du personnage
            mouseY >= character.y &&
            mouseY <= character.y + 50 // Hauteur du personnage
        ) {
            if (character.type === 'ghost') {
                // Déclencher l'animation d'explosion
                const mouseX = event.clientX - canvas.getBoundingClientRect().left;
                const mouseY = event.clientY - canvas.getBoundingClientRect().top;
            
                // Appeler la fonction displayExplosionAnimation avec les coordonnées de la souris
                displayExplosionAnimation(mouseX, mouseY, ctx)
                vibrateScreen();
            }
            // Marquez ce personnage comme "clicqué"
            character.clicked = true;
        }
    });
});


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    characters.forEach(character => {
        drawCharacter(character.image, character.x, character.y);
    });
}

// Mettre à jour la logique du jeu
function update() {
    // Parcourir tous les personnages
    for (let i = characters.length - 1; i >= 0; i--) {
        const character = characters[i];

        // Vérifier si le personnage a été cliqué
        if (character.clicked) {
            // Supprimer le personnage du tableau characters
            characters.splice(i, 1);

            // Si le personnage est un Pacmoon, mettre à jour le score
            if (character.type === 'pacmoon') {
                updateScore(200);
            } else if (character.type === 'ghost') {
                // Si le personnage est un fantôme, mettre à jour les vies
                updateLives();
            }
        } else {
            // Si le personnage n'a pas été cliqué, vérifier s'il est temps de le faire disparaître
            if (character.timeVisible <= 0) {
                // Supprimer le personnage du tableau characters
                characters.splice(i, 1);
            } else {
                // Décrémenter le temps visible du personnage
                character.timeVisible--;
            }
        }
    }
}

// Mettre à jour et dessiner le jeu à chaque rafraîchissement
function gameLoop() {
    update();
    draw();
}


// Générer un personnage supplémentaire toutes les 500 points de score
function checkScore() {
    // Augmenter la vitesse de disparition en fonction du score
    const characterLifetime = Math.max(60, 180 - Math.floor(score / 10)); // Durée de vie initiale de 3 secondes (180 frames) avec un minimum de 1 seconde (60 frames)

    // Mettre à jour la durée de vie de tous les personnages en fonction du score
    characters.forEach(character => {
        character.timeVisible = characterLifetime;
    });
}

// Mettre à jour le jeu et vérifier le score à chaque rafraîchissement
setInterval(() => {
    gameLoop();
}, 1000 / 60); // 60 FPS

// Mettre à jour le nombre d'apparitions de persos tous les 10 secondes
setInterval(() => {
    spawnCharacter();
}, 10000); // 10 secondes