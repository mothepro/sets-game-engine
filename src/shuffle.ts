/** Performs an inplace Fisher-Yates shuffle on an array. */
export default function <T>(array: T[], randomInt: (max: number) => number) {
  let position: number = array.length
  while (position) {
    let temp = randomInt(position--);
    [array[position], array[temp]] = [array[temp], array[position]] as [T, T]
  }
}
