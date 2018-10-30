/** Performs an inplace Fisher-Yates shuffle on an array. */
export function shuffle<T>(array: T[], randomInt: (max: number) => number) {
    let length: number = array.length
    let temp: number
    while (length) {
        temp = randomInt(length--);
        [array[length], array[temp]] = [array[temp], array[length]] as [T, T];
    }
}
