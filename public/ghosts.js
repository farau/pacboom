export let ghosts = []; // Tableau pour stocker les fantômes
export const numGhosts = 3; // Nombre de fantômes

// Types de fantômes
const GhostType = {
    NORMAL: "normal",
    BONUS: "bonus",
    BOMB: "bomb",
    BEEPLE: "beeple"
};

const GhostColor = {
    NORMAL: "red",
    BONUS: "gold",
    BOMB: "blue",
    BEEPLE: "green"
};

// Déclaration des variables
let ghostImages = {}; // Objet pour stocker les images des fantômes

// Chargement des images des fantômes
function loadGhostImages() {
    ghostImages.normal = new Image();
    ghostImages.normal.src = './img/ghost.png';

    ghostImages.bonus = new Image();
    ghostImages.bonus.src = './img/pacmoon.png';

    ghostImages.bomb = new Image();
    ghostImages.bomb.src = './img/bobby.png';

    ghostImages.beeple = new Image();
    ghostImages.beeple.src = './img/beeple.png';
}

// Définir la fonction pour charger et jouer le son du fantôme mangé
function playGhostEatSound() {
    // Chemin vers le fichier audio du fantôme mangé
    const soundPath = './sound/pacman_eatghost.wav';

    // Créer un nouvel élément audio
    const audio = new Audio(soundPath);

    // Charger le son et le jouer
    audio.play();
}

function playGhostEatPacmoonSound() {
    // Chemin vers le fichier audio du fantôme mangé
    const soundPath = './sound/pacman_eatfruit.wav';

    // Créer un nouvel élément audio
    const audio = new Audio(soundPath);

    // Charger le son et le jouer
    audio.play();
}

function playGhostEatBomb() {
    // Chemin vers le fichier audio du fantôme mangé
    const soundPath = './sound/sf_explosion_01.mp3';

    // Créer un nouvel élément audio
    const audio = new Audio(soundPath);

    // Charger le son et le jouer
    audio.play();
}


// Initialisation des fantômes
export function initializeGhosts(ctx, canvasWidth, canvasHeight) {
    // Charger les images des fantômes
    loadGhostImages();

    for (let i = 0; i < numGhosts; i++) {

        let randomNumber = Math.floor(Math.random() * 100) + 1;
        let ghostType, ghostColor;
        if (randomNumber <= 10) {
            ghostType = GhostType.BONUS;
            ghostColor = GhostColor.BONUS;
        } else if (randomNumber > 10 && randomNumber <= 15) {
            ghostType = GhostType.BOMB;
            ghostColor = GhostColor.BOMB;
        } else if (randomNumber > 20 && randomNumber <= 23) {
            ghostType = GhostType.BEEPLE;
            ghostColor = GhostColor.BEEPLE;      
        } else {
            ghostType = GhostType.NORMAL;
            ghostColor = GhostColor.NORMAL;
        }

        let ghost = {
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            size: 20,
            speed: 5,
            direction: Math.random() * 2 * Math.PI,
            isAlive: true,
            type: ghostType // Type de fantôme
            //color: ghostColor // Couleur associée au type de fantôme
        };
        ghosts.push(ghost);
    }
}

// Dessiner les fantômes
export function drawGhosts(ctx) {
    ghosts.forEach((ghost) => {
        if (ghost.isAlive) {
            let ghostImage = ghostImages[ghost.type]; // Obtenir l'image correspondant au type de fantôme

            // Dimensions de l'image agrandie
            let imageSize = ghost.size * 2; // Double la taille du fantôme

            // Dessiner l'image du fantôme
            ctx.drawImage(
                ghostImage, // Image à dessiner
                ghost.x - imageSize / 2, // Position x centrée sur le fantôme
                ghost.y - imageSize / 2, // Position y centrée sur le fantôme
                imageSize, // Largeur de l'image
                imageSize // Hauteur de l'image
            );
        }
    });
}


// Fonction pour calculer la vitesse des nouveaux fantômes en fonction du score
function calculateGhostSpeed(score) {
    // La vitesse de base des fantômes
    let baseSpeed = 3;

    // Multiplier la vitesse de base par un facteur en fonction du score
    let speedFactor = 1 + (score / 5000); // Par exemple, augmenter la vitesse de 2 pour chaque tranche de 500 points

    // Calculer la vitesse finale des fantômes
    let ghostSpeed = baseSpeed * speedFactor;

    return ghostSpeed;
}


const explosionCanvas = document.getElementById("explosionCanvas");
const explosionCtx = explosionCanvas.getContext("2d");

// Fonction pour afficher l'animation d'explosion
function displayExplosionAnimation(x, y, gameCtx) {
    const explosionImage = new Image();
    explosionImage.src = './img/explode.gif'; 

    // Attendre le chargement de l'image avant de l'afficher
    explosionImage.onload = () => {
        // Récupérer les dimensions du canvas
        const canvasWidth = gameCtx.canvas.width;
        const canvasHeight = gameCtx.canvas.height;

        // Dessiner l'image au centre du canvas
        const centerX = canvasWidth / 2 - explosionImage.width / 2;
        const centerY = canvasHeight / 2 - explosionImage.height / 2;
        gameCtx.drawImage(explosionImage, centerX, centerY);

        // Autres actions à effectuer après l'affichage de l'explosion...
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

let beepleBonus = false;
let beepleAudio = null; // Instance audio pour la musique BEEPLE
let beepleTimeoutId = null; // ID du timeout pour la durée du bonus BEEPLE

// Fonction pour activer le bonus BEEPLE
function activateBeepleBonus() {
    // Arrêter l'audio BEEPLE existant s'il est en cours
    if (beepleAudio && !beepleAudio.paused) {
        beepleAudio.pause();
        beepleAudio.currentTime = 0; // Rembobiner l'audio au début
    }

    // Activer le bonus BEEPLE
    beepleBonus = true;
 
    // Jouer la musique BEEPLE
    beepleAudio = new Audio('./sound/pacman_eating.mp3');
    beepleAudio.currentTime = 0; // Rembobiner l'audio au début
    beepleAudio.play(); // Démarrer la lecture de l'audio

    // Définir un timeout pour désactiver le bonus et arrêter la musique après la durée spécifiée
    beepleTimeoutId = setTimeout(() => {
        disableBeepleBonus(); // Désactiver le bonus BEEPLE après la durée spécifiée
    }, 5000); // Durée de la musique BEEPLE (5 secondes)
}

// Fonction pour désactiver le bonus BEEPLE
function disableBeepleBonus() {
    beepleBonus = false; // Désactiver le bonus BEEPLE
    if (beepleAudio && !beepleAudio.paused) {
        beepleAudio.pause(); // Arrêter l'audio si encore en cours de lecture
    }
}

// Gérer les interactions avec les fantômes
export function handleGhostInteractions(ctx, pacmanX, pacmanY, pacmanSize, pacmanDirection, updateScore, score, gameOver, resetGame) {
    ghosts.forEach((ghost) => {
        if (ghost.isAlive) {
            let distance = Math.sqrt(Math.pow(pacmanX - ghost.x, 2) + Math.pow(pacmanY - ghost.y, 2));

            if (distance < pacmanSize + ghost.size) {
                ghost.isAlive = false; // Fantôme mangé par Pacman

                if (ghost.type === GhostType.NORMAL) {
                    playGhostEatSound();
                    updateScore(100);
                } else if (ghost.type === GhostType.BONUS) {
                    playGhostEatPacmoonSound();
                    updateScore(300); // Bonus de points pour les fantômes dorés
                } else if (ghost.type === GhostType.BOMB) {
                    if (beepleBonus) {
                        // Bonus BEEPLE actif : donner un bonus supplémentaire pour les fantômes de type BOMB
                        updateScore(100); // Bonus de points avec Beeple Bonus !
                    } else {
                        ghosts = [];
                        playGhostEatBomb();
                        displayExplosionAnimation(pacmanX, pacmanY, ctx);
                        vibrateScreen();

                        // Ajouter la classe de flash pour déclencher l'animation CSS
                        document.body.classList.add('flash-effect');

                        // Retirer la classe après l'animation pour réinitialiser l'effet
                        setTimeout(() => {
                            document.body.classList.remove('flash-effect');
                        }, 500); // Durée de l'animation en millisecondes

                        setTimeout(gameOver, 100);
                        return;
                    }
                } else if (ghost.type === GhostType.BEEPLE) {
                    // Bonus de points pour les fantômes BEEPLE
                    updateScore(500);
                    if (!beepleBonus) {
                        // Activer le bonus BEEPLE si ce n'est pas déjà activé
                        activateBeepleBonus();
                    } else {
                        // Réinitialiser le délai du bonus BEEPLE lorsqu'un autre BEEPLE est mangé
                        clearTimeout(beepleTimeoutId); // Annuler le timeout actuel
                        activateBeepleBonus(); // Réactiver le bonus BEEPLE avec une nouvelle durée
                    }
                }

                // Ajouter un nouveau fantôme avec une vitesse basée sur le score actuel
                let newGhostSpeed = calculateGhostSpeed(score);
                
                let randomNumber = Math.floor(Math.random() * 10) + 1;
                let ghostType, ghostColor;
                if (randomNumber == 1) {
                    ghostType = GhostType.BONUS;
                    ghostColor = GhostColor.BONUS;

                    //On crée un nouveau fantôme pour complexifier le jeu
                    let newGhost = {
                        x: Math.random() * ctx.canvas.width,
                        y: Math.random() * ctx.canvas.height,
                        size: 20,
                        speed: newGhostSpeed,
                        direction: Math.random() * 2 * Math.PI,
                        isAlive: true,
                        type: GhostType.NORMAL,
                        color: GhostColor.NORMAL
                    };    
                    ghosts.push(newGhost);
                } else if (randomNumber == 6) {
                    ghostType = GhostType.BOMB;
                    ghostColor = GhostColor.BOMB;

                    //On crée un nouveau fantôme pour complexifier le jeu
                    let newGhost = {
                        x: Math.random() * ctx.canvas.width,
                        y: Math.random() * ctx.canvas.height,
                        size: 20,
                        speed: newGhostSpeed,
                        direction: Math.random() * 2 * Math.PI,
                        isAlive: true,
                        type: GhostType.NORMAL,
                        color: GhostColor.NORMAL
                    };    
                    ghosts.push(newGhost);
                }

                // Générer un nouveau fantôme de manière aléatoire
                let newGhost = {
                    x: Math.random() * ctx.canvas.width,
                    y: Math.random() * ctx.canvas.height,
                    size: 20,
                    speed: newGhostSpeed,
                    direction: Math.random() * 2 * Math.PI,
                    isAlive: true,
                    type: generateRandomGhostType(), // Générer un type de fantôme aléatoire
                    color: generateRandomGhostColor() // Générer une couleur de fantôme aléatoire
                };
                ghosts.push(newGhost);
            }
        }
    });
}

// Fonction utilitaire pour générer un type de fantôme aléatoire
function generateRandomGhostType() {
    let randomNumber = Math.floor(Math.random() * 100) + 1;
    if (randomNumber <= 15) {
        return GhostType.BONUS;
    } else if (randomNumber > 15 && randomNumber <= 25) {
        return GhostType.BOMB;
    } else if (randomNumber > 25 && randomNumber <= 29) {
        return GhostType.BEEPLE;
    } else {
        return GhostType.NORMAL;
    }
}

// Fonction utilitaire pour générer une couleur de fantôme aléatoire
function generateRandomGhostColor() {
    let randomNumber = Math.floor(Math.random() * 3);
    switch (randomNumber) {
        case 0:
            return GhostColor.NORMAL;
        case 1:
            return GhostColor.BONUS;
        case 2:
            return GhostColor.BOMB;
        default:
            return GhostColor.NORMAL;
    }
}

// Fonction pour convertir la direction de Pacman en angle en radians
function directionToAngle(direction) {
    switch (direction) {
        case "right":
            return 0;
        case "left":
            return Math.PI;
        case "down":
            return Math.PI / 2;
        case "up":
            return -Math.PI / 2;
        default:
            return 0; // Par défaut, retourner 0 (droite)
    }
}

// Déplacer les fantômes en fonction de leur direction et de leur vitesse
export function moveGhosts(canvasWidth, canvasHeight) {
    ghosts.forEach((ghost) => {
        if (ghost.isAlive) {
            // Calculer les déplacements en x et y en fonction de la direction
            let dx = Math.cos(ghost.direction) * ghost.speed;
            let dy = Math.sin(ghost.direction) * ghost.speed;

            // Mettre à jour la position du fantôme
            ghost.x += dx;
            ghost.y += dy;

            // Vérifier les limites du canvas pour rebondir les fantômes (optionnel)
            if (ghost.x < 0 || ghost.x > canvasWidth) {
                ghost.direction = Math.PI - ghost.direction; // Inverser la direction horizontale
            }
            if (ghost.y < 0 || ghost.y > canvasHeight) {
                ghost.direction = -ghost.direction; // Inverser la direction verticale
            }
        }
    });
}

// Fonction pour calculer la direction d'un vecteur (x, y)
function getDirection(x, y) {
    return Math.atan2(y, x);
}

