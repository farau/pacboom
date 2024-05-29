const fs = require('fs');
const path = require('path');

const directoryPath = './metadata'; // Chemin du dossier à parcourir

// Fonction pour parcourir récursivement les fichiers d'un dossier
function traverseDirectory(dirPath) {
    fs.readdirSync(dirPath).forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            traverseDirectory(filePath); // Si le chemin est un dossier, parcourir récursivement
        } else {
            replaceStringInFile(filePath, 'xxx', 'QmPLWqPrUtKiu9o1mhU9s8uFpkc92BrrY2W4b6SUchh2do'); // Si le chemin est un fichier, remplacer l'occurrence
        }
    });
}

// Fonction pour remplacer une occurrence dans un fichier
function replaceStringInFile(filePath, searchString, replaceString) {
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        const result = data.replace(new RegExp(searchString, 'g'), replaceString);
        fs.writeFile(filePath, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

// Appel de la fonction pour parcourir le dossier
traverseDirectory(directoryPath);
