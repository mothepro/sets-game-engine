import { Color, Shape, Quantity, Opacity, SIZE, COMBINATIONS } from './Details.js'

export type CardSet = [Card, Card, Card]

export default class Card {
  constructor(
    readonly color: Color,
    readonly shape: Shape,
    readonly quantity: Quantity,
    readonly opacity: Opacity,
  ) { }

  /**
   * A unique value representing the details for this card.
   *
   * Possibly this should be the only value stored for the card,
   * and the others are calculated on the fly.
   */
  get encoding(): number {
    return this.color * SIZE ** 0 +
      this.shape      * SIZE ** 1 +
      this.quantity   * SIZE ** 2 +
      this.opacity    * SIZE ** 3
  }

  /** Whether 3 cards make a valid set. */
  static isSet = (...cards: CardSet): boolean =>
    1 == new Set([
      Card.diff(cards[0], cards[1]),
      Card.diff(cards[1], cards[2]),
      Card.diff(cards[2], cards[0]),
    ]).size

  /**
   * Build a Card using a single number as an encoding for Color, Shape, Quantity and Opacity.
   * @param encoding Number between 0 and `combinations`
   */
  static make = (encoding: number): Card =>
    new Card(
      Math.trunc(encoding / SIZE ** 0) % SIZE as Color,
      Math.trunc(encoding / SIZE ** 1) % SIZE as Shape,
      Math.trunc(encoding / SIZE ** 2) % SIZE as Quantity,
      Math.trunc(encoding / SIZE ** 3) % SIZE as Opacity,
    )
  
  /** Generates each possible unique card in a random order. */
  static *randomAll() {
    const cards = [...Array(COMBINATIONS)].map((_, i) => Card.make(i))
    while (cards.length)
      yield cards.splice(Math.random() * cards.length, 1)[0]
  }

  /** A unique value comparing the difference in the card's  */
  private static diff = (card1: Card, card2: Card): number =>
    +(card1.color == card2.color)       << 0 |
    +(card1.shape == card2.shape)       << 1 |
    +(card1.quantity == card2.quantity) << 2 |
    +(card1.opacity == card2.opacity)   << 3
}
