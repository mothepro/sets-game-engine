import { Color, Shape, Quantity, Opacity, size } from './Details.js'

export type CardSet = [Card, Card, Card]

export default class Card {
  constructor(
    public readonly color: Color,
    public readonly shape: Shape,
    public readonly quantity: Quantity,
    public readonly opacity: Opacity,
  ) { }

  /**
   * A unique value representing the details for this card.
   *
   * Possibly this should be the only value stored for the card,
   * and the others are calculated on the fly.
   */
  get encoding(): number {
    return this.color * size ** 0 +
      this.shape      * size ** 1 +
      this.quantity   * size ** 2 +
      this.opacity    * size ** 3
  }

  /** Whether 3 cards make a valid set. */
  public static isSet = (...cards: CardSet): boolean =>
    1 == new Set([
      Card.diff(cards[0], cards[1]),
      Card.diff(cards[1], cards[2]),
      Card.diff(cards[2], cards[0]),
    ]).size

  /**
   * Build a Card using a single number as an encoding for Color, Shape, Quantity and Opacity.
   * @param encoding Number between 0 and `combinations`
   */
  public static make = (encoding: number): Card =>
    new Card(
      Math.trunc(encoding / size ** 0) % size as Color,
      Math.trunc(encoding / size ** 1) % size as Shape,
      Math.trunc(encoding / size ** 2) % size as Quantity,
      Math.trunc(encoding / size ** 3) % size as Opacity,
    )

  /** A unique value comparing the difference in the card's  */
  private static diff = (card1: Card, card2: Card): number =>
    +(card1.color == card2.color)       << 0 |
    +(card1.shape == card2.shape)       << 1 |
    +(card1.quantity == card2.quantity) << 2 |
    +(card1.opacity == card2.opacity)   << 3
}
