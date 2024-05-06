// Importer le fichier des fantômes
// Assurez-vous d'importer avant d'utiliser les fonctions des fantômes
// Ce script doit être inclus après le chargement du HTML, donc placé dans un fichier ou dans le balisage de la page.
import("./ghosts.js");

// Importer le fichier des fantômes
import { initializeGhosts, drawGhosts, handleGhostInteractions, moveGhosts, ghosts } from "./ghosts.js";


// Variables globales
let backgroundCanvas;
let gameCanvas;
let fullCanvas;
let backgroundCtx;
let gameCtx;
let pacmanX;
let pacmanY;
let pacmanSize = 20;
let pacmanSpeed = 7; // Vitesse de déplacement de Pacman
let pacmanDirection = "right"; // Direction initiale de Pacman
let mouthAngle = 0.2; // Angle initial pour l'animation de bouche
let mouthIncrement = 0.05; // Contrôle l'incrémentation de l'angle de la bouche
let score = 0; // Définition et initialisation du score
let gameLoop; // Déclaration de la variable gameLoop
// Définir une variable pour garder une trace de l'état du bouton
let isGameOver = false;


function setScore(score_) {
    score = score_;

}

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

function getCookie(name) {
    const cookieValue = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
    return cookieValue ? cookieValue[2] : null;
}

// Définition de la fonction gameOver
function gameOver() {
    isGameOver = true; // Mettre à jour l'état du jeu à "game over"
    // Autres actions à effectuer en cas de fin de jeu...

    // Gérer l'explosion si elle est en cours
    handleExplosion(gameCtx, pacmanX, pacmanY);
    resetGame();

    // Désactiver le mode plein écran
    exitFullscreen();

    // Fenetre de partage du score
    showGameOverModal(score);

    // Désactiver le gestionnaire d'événements sur le bouton "Start Game"
    document.getElementById("startGameBtn").removeEventListener("click", startGame);
    isRunning = false;

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

        // Dessiner le fond (background) une seule fois
        drawBackground();

        // Initialiser la position de Pacman au centre du canvas de jeu
        pacmanX = gameCanvas.width / 2;
        pacmanY = gameCanvas.height / 2;

        // Initialisation des fantômes
        initializeGhosts(gameCtx, gameCanvas.width, gameCanvas.height);

        // On remet le score à zéro
        setScore(0);

        // Démarrer la boucle de jeu
        gameLoop = setInterval(updateGame, 50); // Appeler updateGame toutes les 50 ms (augmentation de la vitesse)

    }
}




// Dessiner le fond du canvas avec des étoiles fixes
function drawBackground() {
    // Dessiner un fond noir
    backgroundCtx.fillStyle = "black";
    backgroundCtx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

    // Dessiner des étoiles fixes
    backgroundCtx.fillStyle = "white";
    for (let i = 0; i < 50; i++) {
        let x = Math.random() * backgroundCanvas.width;
        let y = Math.random() * backgroundCanvas.height;
        backgroundCtx.fillRect(x, y, 2, 2); // Dessiner une étoile de taille 2x2
    }
}

// Dessiner Pacman sur le canvas avec animation de bouche
function drawPacman() {
    // Calculer les angles de début et de fin pour l'animation de bouche
    let startAngle, endAngle;

    // Déterminer les angles en fonction de la direction de déplacement
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
            startAngle = 3/2 * Math.PI + mouthAngle;
            endAngle = 3/2 * Math.PI - mouthAngle;
            break;
        case "down":
            startAngle = 1/2 * Math.PI + mouthAngle;
            endAngle = 1/2 * Math.PI - mouthAngle;
            break;
        default:
            break;
    }

   // Dessiner Pacman en fonction de la direction avec animation de bouche
   gameCtx.fillStyle = "yellow";
   gameCtx.beginPath();
   gameCtx.arc(Math.floor(pacmanX), Math.floor(pacmanY), pacmanSize, startAngle, endAngle);
   gameCtx.lineTo(Math.floor(pacmanX), Math.floor(pacmanY));
   gameCtx.closePath();
   gameCtx.fill();


    // Mettre à jour l'angle de la bouche pour l'animation
    mouthAngle += mouthIncrement;
    if (mouthAngle >= 0.8 || mouthAngle <= 0.2) {
        mouthIncrement = -mouthIncrement; // Inverser l'incrémentation pour changer de direction
    }
}


// Variable globale pour stocker l'état de la touche "SPACE"
let isSpacePressed = false;

// Gestionnaire d'événement pour la pression de touche
document.addEventListener("keydown", function(event) {
    if (event.key === " ") { // Vérifie si la touche pressée est "SPACE"
        event.preventDefault(); // Empêche le comportement par défaut de la touche "SPACE" (par exemple, défilement de la page)

        // Vérifie si le jeu est en cours et que ce n'est pas en game over
        if (isRunning && !isGameOver) {
            isSpacePressed = true; // Marque la touche "SPACE" comme enfoncée
        }
    }
    
});


// Gestionnaire d'événement pour le relâchement de touche
document.addEventListener("keyup", function(event) {
    if (event.key === " ") { // Vérifie si la touche relâchée est "SPACE"
        isSpacePressed = false; // Marque la touche "SPACE" comme relâchée
    }
});


// Fonction pour déplacer Pacman en fonction de la direction et de la vitesse
function movePacman() {
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
            playMusic(); // Démarrer la musique lorsque la touche est enfoncée
        } else if (event.type === 'keyup') {
            stopMusic(); // Arrêter la musique lorsque la touche est relâchée
        }
    }
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


function drawScore() {
    // Dessiner le score dans le canvas
    gameCtx.fillStyle = "white";
    gameCtx.font = "16px Arial";
    gameCtx.fillText("Score: " + score, 20, 30);
}

// Fonction pour mettre à jour le score
function updateScore(points) {
    score += points;
}



// Mettre à jour le jeu à chaque frame
function updateGame() {
    clearGameCanvas(); // Effacer seulement le canvas de jeu
    movePacman();
    moveGhosts(gameCanvas.width, gameCanvas.height); // Appeler moveGhosts avec les dimensions du canvas
    
    // Appel de la fonction de gestion des interactions avec les fantômes
    handleGhostInteractions(gameCtx, pacmanX, pacmanY, pacmanSize, pacmanDirection, updateScore, score, gameOver, resetGame);   
    drawPacman();
    drawGhosts(gameCtx); // Appel de la fonction de dessin des fantômes
    drawScore();
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

    //On remet à zéro tout ce qui concerne le mode tactile
    stopMusic();

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
    // Réactiver le gestionnaire d'événements sur le bouton "Start Game"
    document.getElementById("startGameBtn").addEventListener("click", startGame);
    startGameBtn.classList.remove("btn-disabled");

}


// Récupérer le bouton "Start Game"
const startGameBtn = document.getElementById("startGameBtn");
// Vérifier si la largeur de l'écran est inférieure à une certaine valeur (typiquement une largeur de smartphone)
const isSmartphone = window.innerWidth < 768; // Vous pouvez ajuster cette valeur selon vos besoins


// Gérer le clic sur le bouton
startGameBtn.addEventListener("click", function() {
    // Désactiver visuellement le bouton après le premier clic
    startGameBtn.classList.add("btn-disabled");

    // Démarrer le jeu ou effectuer d'autres actions ici...
    startGame();
    // Attacher les gestionnaires d'événements tactiles uniquement si c'est un smartphone
    if (isSmartphone) {
        blockPageScroll(); // Bloque le défilement de la page

        enterFullscreen(fullCanvas);
        // Gestionnaire d'événement pour touchstart (au début du toucher)
        document.addEventListener("touchstart", handleTouchStart);

        // Gestionnaire d'événement pour touchmove (mouvement du toucher)
        document.addEventListener("touchmove", handleTouchMove, { passive: false });

        // Gestionnaire d'événement pour touchend (fin du toucher)
        document.addEventListener("touchend", handleTouchEnd);
    }
    startGameBtn.classList.remove("btn-disabled");
});


// Variable pour stocker les coordonnées initiales du toucher
let initialX = null;
let initialY = null;
let isMusicPlaying = false; // Variable de contrôle pour vérifier si la musique est en cours de lecture

// Fonction pour gérer le début du toucher
function handleTouchStart(event) {

    // Récupérer les coordonnées initiales du toucher
    initialX = event.touches[0].clientX;
    initialY = event.touches[0].clientY;

    // Vérifier si l'écran est petit (par exemple, smartphone) et si le toucher est à l'intérieur du canvas
    if (window.innerWidth <= 768 && !isMusicPlaying) {
        // Accélérer le mouvement de Pacman
        isSpacePressed = true;
        // Jouer la musique
        playMusic();
        isMusicPlaying = true; // Mettre à jour la variable de contrôle
    }
}

function handleTouchEnd(event) {

    // Réinitialiser les coordonnées du toucher initial
    initialX = null;
    initialY = null;

    
    if (window.innerWidth <= 768) {
        // Arrêter d'accélérer le mouvement de Pacman
        isSpacePressed = false;
        // Arrêter de jouer la musique
        stopMusic();
        isMusicPlaying = false; // Mettre à jour la variable de contrôle
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

    // Réinitialiser les coordonnées du toucher initial pour le prochain mouvement
    initialX = null;
    initialY = null;
}


function enterFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { /* Firefox */
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { /* Chrome, Safari, and Opera */
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE/Edge */
        element.msRequestFullscreen();
    } else if (element.webkitEnterFullscreen) { /* Older versions of Safari */
        element.webkitEnterFullscreen();
    } else if (element.webkitEnterFullScreen) { /* Older versions of Safari */
        element.webkitEnterFullScreen();
    } else if (element.mozFullScreen) { /* Firefox for older versions */
        element.mozFullScreen();
    } else if (element.msFullscreenElement) { /* IE/Edge */
        element.msFullscreenElement();
    } else if (element.webkitIsFullScreen) { /* Older versions of Safari */
        element.webkitIsFullScreen();
    } else if (element.webkitFullScreen) { /* Older versions of Safari */
        element.webkitFullScreen();
    }
}


// Fonction pour désactiver le mode plein écran
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari, and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    } else if (document.webkitCancelFullScreen) { /* Older versions of Safari */
        document.webkitCancelFullScreen();
    } else if (document.webkitCancelFullscreen) { /* Older versions of Safari */
        document.webkitCancelFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox for older versions */
        document.mozCancelFullScreen();
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