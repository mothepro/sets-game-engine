export const enum Color {
  BLUE,
  RED,
  GREEN,
}

export const enum Shape {
  SQUARE,
  CIRCLE,
  TRIANGLE,
}
export const enum Quantity {
  ONE,
  TWO,
  THREE,
}

export const enum Opacity {
  SOLID,
  HALF,
  EMPTY,
}

/** The max number of elements per particular detail. */
export const SIZE = 3

/** The total number of unique details. */
export const COUNT = 4

/** Number of total different combinations of cards. */
export const COMBINATIONS = SIZE ** COUNT
