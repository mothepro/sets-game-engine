/** Performs an inplace Fisher-Yates shuffle on an array. */
export function shuffle<T>(array: T[]) {
    let length = array.length
    let temp: number
    while (length) {
        temp = (Math.random() * length--) >>> 0;
        [array[length], array[temp]] = [array[temp], array[length]]
    }
}