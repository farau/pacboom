const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const categoryImages = {
    head: [null, './img/head/cap.png', './img/head/crown.png', './img/head/hat.png', './img/head/luffy-hat.png', './img/head/magician-hat.png','./img/head/ribbon.png','./img/head/stetson.png', './img/head/cooking-hat.png', './img/head/viking-helmet.png', './img/head/pirate-hat.png', './img/head/stetson.png'],
    eyes: [null, './img/eyes/glasses.png', './img/eyes/gold-sunglasses.png', './img/eyes/sunglasses-cig.png','./img/eyes/sunglasses.png', './img/eyes/laser.png'],
    neck: [null, './img/neck/gold-necklace.png', './img/neck/bow-tie.png', './img/neck/scarf.png', './img/neck/tie.png'],
    arm: [null, './img/arm/muscle.png', './img/arm/bone-sword.png', './img/arm/robotic.png', './img/arm/zombie.png']
};

// Fonction pour générer toutes les combinaisons possibles d'images pour chaque catégorie
function generateAllImageCombinations(categoryImages) {
    const allCombinations = [];
    const headImages = categoryImages.head;
    const eyesImages = categoryImages.eyes;
    const neckImages = categoryImages.neck;
    const armImages = categoryImages.arm;

    headImages.forEach(headImage => {
        eyesImages.forEach(eyesImage => {
            neckImages.forEach(neckImage => {
                armImages.forEach(armImage => {
                    allCombinations.push({ head: headImage, eyes: eyesImage, neck: neckImage, arm: armImage });
                });
            });
        });
    });

    // Mélanger les combinaisons
    shuffleArray(allCombinations);

    return allCombinations;
}

// Fonction pour mélanger un tableau (algorithme de Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function drawImageCombination(combination, imageWidth, imageHeight) {
    const canvas = createCanvas(imageWidth, imageHeight);
    const ctx = canvas.getContext('2d');

    const loadImageAsync = async imagePath => {
        return new Promise((resolve, reject) => {
            loadImage(imagePath).then(image => {
                resolve(image);
            }).catch(error => {
                reject(error);
            });
        });
    };


    // Dessiner le fond noir dégradé
    const gradient = ctx.createLinearGradient(0, 0, 0, imageHeight);
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, imageWidth, imageHeight);

    // Dessiner des étoiles
    const drawStars = (numStars) => {
        for (let i = 0; i < numStars; i++) {
            const x = Math.random() * imageWidth;
            const y = Math.random() * imageHeight;
            const radius = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        }
    };

    drawStars(50); // Vous pouvez ajuster le nombre d'étoiles selon vos préférences

    // Charger l'image de fond
    const backgroundImage = await loadImageAsync('./img/pacmoon.png');
    ctx.drawImage(backgroundImage, 0, 0, imageWidth, imageHeight);


    for (const category in combination) {
        const imagePath = combination[category];
        if (imagePath) {
            const image = await loadImageAsync(imagePath);
            ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
        }
    }

    return canvas;
}


// Fonction pour extraire le nom de fichier à partir du chemin d'accès
function extractImageName(imagePath) {
    // Diviser le chemin d'accès en parties en utilisant '/'
    const parts = imagePath.split('/');
    // Le nom de fichier est la dernière partie avant '.png'
    const fileName = parts[parts.length - 1].replace('.png', '');
    return fileName;
}

// Générer toutes les combinaisons d'images pour le couple (head, eyes, neck, arm)
const allImageCombinations = generateAllImageCombinations(categoryImages);
console.log(allImageCombinations);
(async () => {
    // Créer un seul canvas de taille 6000x6000
    const canvasWidth = 3000; // Largeur du grand canvas
    const canvasHeight = 4000; // Hauteur du grand canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Dessiner chaque combinaison sur le grand canvas
    for (let i = 0; i < allImageCombinations.length; i++) {
        console.log("Image num ", i);
        const imageCombination = allImageCombinations[i];

        const headImagePath = imageCombination.head;
        const eyesImagePath = imageCombination.eyes;
        const neckImagePath = imageCombination.neck;
        const armImagePath = imageCombination.arm;
    
        // Extraire le nom de fichier de chaque chemin d'accès
        const headImageName = headImagePath ? extractImageName(headImagePath) : null;
        const eyesImageName = eyesImagePath ? extractImageName(eyesImagePath) : null;
        const neckImageName = neckImagePath ? extractImageName(neckImagePath) : null;
        const armImageName = armImagePath ? extractImageName(armImagePath) : null;

    
        // Définir la structure des métadonnées
        const metadata = {
            name: "Pac Boom",
            description: "Play to PacBoom and get a boost by holding an NFT from the collection !",
            image: "ipfs://xxx/"+i+".png",
            external_url: "https://pacboom.com",
            // Ajoutez d'autres métadonnées selon vos besoins
            attributes: [
                {
                trait_type: "arm",
                value: armImageName
                },
                {
                trait_type: "eyes",
                value: eyesImageName
                },
                {
                trait_type: "head",
                value: headImageName
                },
                {
                trait_type: "neck",
                value: neckImageName
                },
            ]
        };
        
        // Convertir les métadonnées en JSON
        const metadataJSON = JSON.stringify(metadata, null, 2);
        
        // Enregistrer les métadonnées dans un fichier JSON
        fs.writeFileSync('metadata/'+i, metadataJSON);
        
        console.log('Métadonnées ' + i + '.json' + 'générées avec succès !');

        const imageCanvas = await drawImageCombination(imageCombination, 300, 300); // Taille de chaque petit canvas est de 16x16

        // Enregistrer les canvas en tant qu'image PNG
        const outputPath = './pacboomnfts/'+i+'.png'; // Chemin de sortie du fichier PNG
        const out = fs.createWriteStream(outputPath);
        const stream = imageCanvas.createPNGStream();
        stream.pipe(out);
        out.on('finish', () => console.log('Image saved:', outputPath));
    }
    console.log("Finished !");
    
})();