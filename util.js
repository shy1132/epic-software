const crypto = require('crypto')

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = crypto.randomBytes(4).readUint32LE() % array.length;
        [ array[i], array[j] ] = [ array[j], array[i] ];
    }

    return array;
}

module.exports.shuffleArray = shuffleArray;