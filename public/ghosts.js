export let ghosts = []; // Tableau pour stocker les fantômes
export const numGhosts = 3; // Nombre de fantômes

// Types de fantômes
const GhostType = {
    NORMAL: "normal",
    BONUS: "bonus",
    BOMB: "bomb"
};

const GhostColor = {
    NORMAL: "red",
    BONUS: "gold",
    BOMB: "blue"
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

        let randomNumber = Math.floor(Math.random() * 10) + 1;
        let ghostType, ghostColor;
        if (randomNumber == 1) {
            ghostType = GhostType.BONUS;
            ghostColor = GhostColor.BONUS;
        } else if (randomNumber == 6) {
            ghostType = GhostType.BOMB;
            ghostColor = GhostColor.BOMB;
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

// Gérer les interactions avec les fantômes
export function handleGhostInteractions(ctx, pacmanX, pacmanY, pacmanSize, pacmanDirection, updateScore, score, gameOver, resetGame) {
    ghosts.forEach((ghost) => {
        if (ghost.isAlive) {
            let distance = Math.sqrt(Math.pow(pacmanX - ghost.x, 2) + Math.pow(pacmanY - ghost.y, 2));
            
            if (distance < pacmanSize + ghost.size) {
                let ghostDirection = Math.atan2(pacmanY - ghost.y, pacmanX - ghost.x);

                // Calculer l'angle entre Pacman et le fantôme
                let angleDifference = Math.abs(directionToAngle(pacmanDirection) - ghostDirection);

                angleDifference = Math.min(angleDifference, 2 * Math.PI - angleDifference); // Normaliser l'angle
                
                // Vérifier la direction de Pacman par rapport au fantôme
                if (1 == 2) {
                    //ghosts = []; 
                    //gameOver(); // Pacman est touché par l'arrière
                } else {
                    ghost.isAlive = false; // Fantôme mangé par Pacman
                    
                    if (ghost.type === GhostType.NORMAL) {
                        playGhostEatSound();
                        updateScore(100);
                    } else if (ghost.type === GhostType.BONUS) {
                        playGhostEatPacmoonSound();
                        updateScore(300); // Bonus de points pour les fantômes dorés
                    } else if (ghost.type === GhostType.BOMB) {
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
                    } else {
                        ghostType = GhostType.NORMAL;
                        ghostColor = GhostColor.NORMAL;
                    }

                    let newGhost = {
                        x: Math.random() * ctx.canvas.width,
                        y: Math.random() * ctx.canvas.height,
                        size: 20,
                        speed: newGhostSpeed,
                        direction: Math.random() * 2 * Math.PI,
                        isAlive: true,
                        type: ghostType,
                        color: ghostColor
                    };
                    ghosts.push(newGhost);

                }
            }
        }
    });
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

