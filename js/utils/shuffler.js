/**
 * Fisher-Yates shuffle algorithm.
 * Mutates the array in-place and returns it.
 * @param {Array} array 
 * @returns {Array} Shuffled array
 */
export function shuffle(originalArray) {
    if (!Array.isArray(originalArray)) return originalArray;
    const array = [...originalArray];
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}
