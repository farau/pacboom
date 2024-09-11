export let ghosts = []; // Tableau pour stocker les fantômes
export const numGhosts = 3; // Nombre de fantômes

// Types de fantômes
const GhostType = {
    NORMAL: "normal",
    BONUS: "bonus",
    BOMB: "bomb",
    BEEPLE: "beeple",
    LAMBOLAND: "lamboland",
    JENNDEFER: "jenndefer"
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
    ghostImages.bomb.src = './img/french.png';

    ghostImages.beeple = new Image();
    ghostImages.beeple.src = './img/durov.png';

    ghostImages.lamboland = new Image();
    ghostImages.lamboland.src = './img/lamboland.png';

    ghostImages.jenndefer = new Image();
    ghostImages.jenndefer.src = './img/jenndefer.png';
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

export function playGhostEatBomb() {
    // Chemin vers le fichier audio du fantôme mangé
    const soundPath = './sound/sf_explosion_01.mp3';

    // Créer un nouvel élément audio
    const audio = new Audio(soundPath);

    // Charger le son et le jouer
    audio.play();
}

export function playGhostEatLamboland() {
    // Chemin vers le fichier audio du fantôme mangé
    const soundPath = './sound/pacman_death.wav';

    // Créer un nouvel élément audio
    const audio = new Audio(soundPath);

    // Charger le son et le jouer
    audio.play();
}

export function playGhostEatJenndefer() {
    // Chemin vers le fichier audio du fantôme mangé
    const soundPath = './sound/pacman_big.mp3';

    // Créer un nouvel élément audio
    const audio = new Audio(soundPath);

    // Charger le son et le jouer
    audio.play();
}

function playBulletTouchSound() {
    // Chemin vers le fichier audio du fantôme mangé
    const soundPath = './sound/bullet_shoot.mp3';

    // Créer un nouvel élément audio
    const audio = new Audio(soundPath);

    // Charger le son et le jouer
    audio.play();
}

// Initialisation des fantômes
export function initializeGhosts(ctx, canvasWidth, canvasHeight, pacmanX, pacmanY, pacmanSize) {
    // Charger les images des fantômes
    loadGhostImages();
    ghosts = [];

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
            x: Math.random() * canvasWidth, // Initialize x property with random value within canvas boundaries
            y: Math.random() * canvasHeight, // Initialize y property with random value within canvas boundaries
            size: 20,
            speed: 5,
            direction: Math.random() * 2 * Math.PI,
            isAlive: true,
            type: ghostType // Type de fantôme
            //color: ghostColor // Couleur associée au type de fantôme
        };
        // Regenerate ghost position if it's inside Pacman square
        while (ghost.x >= pacmanX - pacmanSize && ghost.x <= pacmanX + pacmanSize &&
            ghost.y >= pacmanY - pacmanSize && ghost.y <= pacmanY + pacmanSize) {
            ghost.x = Math.random() * ctx.canvas.width;
            ghost.y = Math.random() * ctx.canvas.height;
        }
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
            if (ghost.type == GhostType.BOMB) {
                imageSize = ghost.size * 4;
            }

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
    let speedFactor = 1 + (score / 10000); // Par exemple, augmenter la vitesse de 2 pour chaque tranche de 10000 points

    // Calculer la vitesse finale des fantômes
    let ghostSpeed = baseSpeed * speedFactor;

    return ghostSpeed;
}


const explosionCanvas = document.getElementById("explosionCanvas");
const explosionCtx = explosionCanvas.getContext("2d");

// Fonction pour afficher l'animation d'explosion
export function displayExplosionAnimation(x, y, gameCtx) {
    const explosionImage = new Image();
    explosionImage.src = './img/boom.gif'; 

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

export function vibrateScreen() {
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
function activateBeepleBonus(setColor) {
    // Arrêter l'audio BEEPLE existant s'il est en cours
    if (beepleAudio && !beepleAudio.paused) {
        beepleAudio.pause();
        beepleAudio.currentTime = 0; // Rembobiner l'audio au début
    }

    // Activer le bonus BEEPLE
    beepleBonus = true;
    setColor("#ADD8E6");
    // Jouer la musique BEEPLE
    beepleAudio = new Audio('./sound/pacman_eating.mp3');
    beepleAudio.currentTime = 0; // Rembobiner l'audio au début
    beepleAudio.play(); // Démarrer la lecture de l'audio

    // Définir un timeout pour désactiver le bonus et arrêter la musique après la durée spécifiée
    beepleTimeoutId = setTimeout(() => {
        disableBeepleBonus(setColor); // Désactiver le bonus BEEPLE après la durée spécifiée
    }, 5000); // Durée de la musique BEEPLE (5 secondes)
}

// Fonction pour désactiver le bonus BEEPLE
function disableBeepleBonus(setColor) {
    beepleBonus = false; // Désactiver le bonus BEEPLE
    setColor("yellow");
    if (beepleAudio && !beepleAudio.paused) {
        beepleAudio.pause(); // Arrêter l'audio si encore en cours de lecture
    }
}

let lambolandBonus = false;
let lambolandTimeoutId = null; // ID du timeout pour la durée du bonus LAMBOLAND

// Fonction pour activer le bonus BEEPLE
function activateLambolandBonus(ctx, setPacmanSpeed, setColor) {
    // Activer le bonus LAMBOLAND
    lambolandBonus = true;
    setColor("#7D7D7D"); //changer pacman en gris
    setPacmanSpeed(3);
    // Définir un timeout pour désactiver le bonus et arrêter la musique après la durée spécifiée
    lambolandTimeoutId = setTimeout(() => {
        disableLambolandBonus(ctx, setPacmanSpeed, setColor); // Désactiver le bonus BEEPLE après la durée spécifiée
    }, 5000); // Durée de la musique BEEPLE (5 secondes)
}

// Fonction pour désactiver le bonus BEEPLE
function disableLambolandBonus(ctx, setPacmanSpeed, setColor) {
    lambolandBonus = false; // Désactiver le bonus BEEPLE
    setPacmanSpeed(7); //vitesse d'origine
    setColor("yellow"); //pacman retrouve sa couleur jaune
}


let jenndeferBonus = false;
let jenndeferTimeoutId = null; // ID du timeout pour la durée du bonus LAMBOLAND

// Fonction pour activer le bonus BEEPLE
function activateJenndeferBonus(setSize) {
    // Activer le bonus JENNDEFER
    jenndeferBonus = true;
    setSize(40); //doubler la taille de pacman
    // Définir un timeout pour désactiver le bonus et arrêter la musique après la durée spécifiée
    jenndeferTimeoutId = setTimeout(() => {
        disableJenndeferBonus(setSize); // Désactiver le bonus BEEPLE après la durée spécifiée
    }, 5000); // Durée de la musique BEEPLE (5 secondes)
}

// Fonction pour désactiver le bonus BEEPLE
function disableJenndeferBonus(setSize) {
    jenndeferBonus = false; // Désactiver le bonus BEEPLE
    setSize(20); //taille d'origine
}

// Gérer les interactions avec les fantômes
export function handleGhostInteractions(ctx, pacmanX, pacmanY, pacmanSize, pacmanDirection, updateScore, score, gameOver, resetGame, setSpeedPacman, setColor, setSize) {
    ghosts.forEach((ghost) => {
        if (ghost.isAlive) {
            let distance = Math.sqrt(Math.pow(pacmanX - ghost.x, 2) + Math.pow(pacmanY - ghost.y, 2));

            if (distance < pacmanSize + ghost.size) {
                ghost.isAlive = false; // Fantôme mangé par Pacman

                if (ghost.type === GhostType.NORMAL) {
                    playGhostEatSound();
                    // Utilisation de la fonction pour incrémenter le score avec un type de monstre spécifié
                    // Par exemple, pour un monstre de type NORMAL
                    score += 100;
                } else if (ghost.type === GhostType.BONUS) {
                    playGhostEatPacmoonSound();
                    score += 300; // Bonus de points pour les fantômes dorés
                } else if (ghost.type === GhostType.BOMB) {
                    if (beepleBonus) {
                        // Bonus BEEPLE actif : donner un bonus supplémentaire pour les fantômes de type BOMB
                        score += 500; // Bonus de points avec Beeple Bonus !
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
                    score += 500;
                    if (!beepleBonus) {
                        // Activer le bonus BEEPLE si ce n'est pas déjà activé
                        activateBeepleBonus(setColor);
                    } else {
                        // Réinitialiser le délai du bonus BEEPLE lorsqu'un autre BEEPLE est mangé
                        clearTimeout(beepleTimeoutId); // Annuler le timeout actuel
                        activateBeepleBonus(setColor); // Réactiver le bonus BEEPLE avec une nouvelle durée
                    }
                } else if (ghost.type === GhostType.LAMBOLAND) {
                    // Aucun bonus de points pour les fantômes LAMBOLAND
                    // Pas de bonus avec LAMBOLAND
                    playGhostEatLamboland();
                    if (!lambolandBonus) {
                        // Activer le bonus BEEPLE si ce n'est pas déjà activé
                        activateLambolandBonus(ctx, setSpeedPacman, setColor);
                    } else {
                        // Réinitialiser le délai du bonus BEEPLE lorsqu'un autre BEEPLE est mangé
                        clearTimeout(lambolandTimeoutId); // Annuler le timeout actuel
                        activateLambolandBonus(ctx, setSpeedPacman, setColor); // Réactiver le bonus BEEPLE avec une nouvelle durée
                    }
                } else if (ghost.type === GhostType.JENNDEFER) {
                    // Bonus de 1000 points pour les fantômes JENNDEFER car on risque de se faire tuer plus facilement ensuite
                    score += 1000; // Pas de bonus avec LAMBOLAND
                    playGhostEatJenndefer();
                    if (!jenndeferBonus) {
                        // Activer le bonus BEEPLE si ce n'est pas déjà activé
                        activateJenndeferBonus(setSize);
                    } else {
                        // Réinitialiser le délai du bonus BEEPLE lorsqu'un autre BEEPLE est mangé
                        clearTimeout(jenndeferTimeoutId); // Annuler le timeout actuel
                        activateJenndeferBonus(setSize); // Réactiver le bonus BEEPLE avec une nouvelle durée
                    }
                }

                // Mise à jour du score
                updateScore(score);

                // Ajouter un nouveau fantôme avec une vitesse basée sur le score actuel
                let newGhostSpeed = calculateGhostSpeed(score);
            
                let randomNumber = Math.floor(Math.random() * 10) + 1;
                let ghostType, ghostColor;
                if (randomNumber >= 1 && randomNumber < 3) {
                    ghostType = GhostType.NORMAL;
                    ghostColor = GhostColor.NORMAL;

                    //On crée un nouveau fantôme pour complexifier le jeu
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
                    while (newGhost.x >= pacmanX - pacmanSize && newGhost.x <= pacmanX + pacmanSize &&
                        newGhost.y >= pacmanY - pacmanSize && newGhost.y <= pacmanY + pacmanSize) {
                            newGhost.x = Math.random() * ctx.canvas.width;
                            newGhost.y = Math.random() * ctx.canvas.height;
                    }
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
                while (newGhost.x >= pacmanX - pacmanSize && newGhost.x <= pacmanX + pacmanSize &&
                    newGhost.y >= pacmanY - pacmanSize && newGhost.y <= pacmanY + pacmanSize) {
                        newGhost.x = Math.random() * ctx.canvas.width;
                        newGhost.y = Math.random() * ctx.canvas.height;
                }
                ghosts.push(newGhost);
            }
        }
    });
}

export function handleBulletInteractions(ctx, bullets, updateScore, score, pacmanX, pacmanY, pacmanSize) {
    if (!Array.isArray(bullets) || bullets.length === 0) {
        //console.log("Aucune balle présente");
        return;
    }

    let bullet = bullets[0]; // On prend la première balle du tableau

    ghosts.forEach((ghost) => {
        if (ghost.isAlive) {
            // Calcul de la distance entre la balle et le fantôme
            let distance = Math.sqrt(Math.pow(bullet.x - ghost.x, 2) + Math.pow(bullet.y - ghost.y, 2));
    
            if (distance < bullet.size + ghost.size) {

                // Calculer le vecteur de recul
                let dx = ghost.x - bullet.x;
                let dy = ghost.y - bullet.y;
                let magnitude = Math.sqrt(dx * dx + dy * dy);
    
                // Normaliser le vecteur (direction du recul)
                dx /= magnitude;
                dy /= magnitude;
    
                // Appliquer le recul
                let recoilDistance = 30; // Nombre de pixels de recul
                ghost.x += dx * recoilDistance;
                ghost.y += dy * recoilDistance;
    
                // Commencer l'effet de vibration
                let vibrationTime = 1000; // Durée totale de la vibration en ms
                let vibrationIntensity = 15; // Intensité de la vibration en pixels
                let vibrationInterval = 30; // Intervalle de temps entre chaque vibration en ms
    
                let vibrationStartTime = Date.now();
    
                let vibrationIntervalID = setInterval(() => {
                    let elapsed = Date.now() - vibrationStartTime;
    
                    if (elapsed >= vibrationTime) {
                        clearInterval(vibrationIntervalID);
                        ghost.x = ghost.originalX;
                        ghost.y = ghost.originalY;
                    } else {
                        // Faire vibrer le fantôme
                        ghost.x = ghost.originalX + (Math.random() - 0.5) * vibrationIntensity;
                        ghost.y = ghost.originalY + (Math.random() - 0.5) * vibrationIntensity;
                    }
                }, vibrationInterval);
    
                // Si la balle touche un fantôme, elle est détruite
                bullets.splice(0, 1); // On retire la balle du tableau
    
                // Incrémenter le score
                score += 300;
    
                // Jouer le son et marquer le fantôme comme "mort"
                playBulletTouchSound();
                setTimeout(function() {
                    ghost.isAlive = false;
                }, 1000); 
    
                // mettre à jour le score
                updateScore(score);
    
                // Ajouter un nouveau fantôme avec une vitesse basée sur le score actuel
                let newGhostSpeed = calculateGhostSpeed(score);
    
                // Générer un nouveau fantôme
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
                while (newGhost.x >= pacmanX - pacmanSize && newGhost.x <= pacmanX + pacmanSize &&
                    newGhost.y >= pacmanY - pacmanSize && newGhost.y <= pacmanY + pacmanSize) {
                        newGhost.x = Math.random() * ctx.canvas.width;
                        newGhost.y = Math.random() * ctx.canvas.height;
                }
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
    } else if (randomNumber > 25 && randomNumber <= 30) {
        return GhostType.BEEPLE;
    } else if (randomNumber > 30 && randomNumber <= 40) {
        return GhostType.LAMBOLAND;
    } else if (randomNumber > 40 && randomNumber <= 45) {
        return GhostType.JENNDEFER;
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

