
export const enum Color { BLUE, RED, GREEN }
export const enum Shape { SQUARE, CIRCLE, TRIANGLE }
export const enum Quantity { ONE, TWO, THREE }
export const enum Opacity { SOLID, HALF, EMPTY }

export interface CardDetails {
    color: Color
    shape: Shape
    quantity: Quantity
    opacity: Opacity
}

export default class Card {
    /**
     * The max number of elements in a particular detail.
     */
    static readonly DETAILS_SIZE = 3

    /**
     * The total number of details per card.
     */
    static readonly DETAILS_COUNT = 4

    /**
     * Number of total different combinations of cards.
     * the max # of options for each detail raised to the # of details.
     */
    static readonly COMBINATIONS = Card.DETAILS_SIZE ** Card.DETAILS_COUNT

    constructor(
        public readonly color: Color,
        public readonly shape: Shape,
        public readonly quantity: Quantity,
        public readonly opacity: Opacity,
    ) {}

    /**
     * A unique value representing the details for this card.
     *
     * Possibly this should be the only value stored for the card,
     * and the others are calculated on the fly.
     */
    get encoding(): number {
        return this.color   * Card.DETAILS_SIZE ** 0 +
            this.shape      * Card.DETAILS_SIZE ** 1 +
            this.quantity   * Card.DETAILS_SIZE ** 2 +
            this.opacity    * Card.DETAILS_SIZE ** 3
    }

    /**
     * A unique value comparing the difference in the card's details.
     */
    protected static diff(card1: Card, card2: Card): number {
        return +(card1.color === card2.color)       << 0 |
            +(card1.shape === card2.shape)          << 1 |
            +(card1.quantity === card2.quantity)    << 2 |
            +(card1.opacity === card2.opacity)      << 3
    }

    /**
     * Whether 3 cards make a set.
     */
    public static isSet(card1: Card, card2: Card, card3: Card): boolean {
        const first = Card.diff(card1, card2)
        return [
            Card.diff(card2, card3),
            Card.diff(card3, card1),
        ].every(diff => diff === first)
    }

    /**
     * Build a Card using a single number as an encoding for Color, Shape, Quantity and Opacity.
     *
     * @param {number} encoding Number between 0 and total combinations
     */
    static make(encoding: number): Card {
        return new Card(
            Math.floor(encoding / Card.DETAILS_SIZE ** 0) % Card.DETAILS_SIZE as Color,
            Math.floor(encoding / Card.DETAILS_SIZE ** 1) % Card.DETAILS_SIZE as Shape,
            Math.floor(encoding / Card.DETAILS_SIZE ** 2) % Card.DETAILS_SIZE as Quantity,
            Math.floor(encoding / Card.DETAILS_SIZE ** 3) % Card.DETAILS_SIZE as Opacity,
        )
    }
}