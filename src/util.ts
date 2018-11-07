/** Performs an inplace Fisher-Yates shuffle on an array. */
export function shuffle<T>(array: T[], randomInt = (max: number) => (Math.random() * max) >>> 0) {
    let position: number = array.length
    let temp: number
    while (position) {
        temp = randomInt(position--);
        [array[position], array[temp]] = [array[temp], array[position]] as [T, T];
    }
}
