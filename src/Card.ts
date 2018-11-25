export type CardSet = [Card, Card, Card]

export namespace Details {
    export const enum Color { BLUE, RED, GREEN }
    export const enum Shape { SQUARE, CIRCLE, TRIANGLE }
    export const enum Quantity { ONE, TWO, THREE }
    export const enum Opacity { SOLID, HALF, EMPTY }

    /** The max number of elements per particular detail. */
    export const size = 3

    /** The total number of unique details. */
    export const count = 4

    /**
     * Number of total different combinations of cards.
     * the max # of options for each detail raised to the # of details.
     */
    export const combinations = size ** count
}

export default class Card {
    constructor(
        public readonly color: Details.Color,
        public readonly shape: Details.Shape,
        public readonly quantity: Details.Quantity,
        public readonly opacity: Details.Opacity,
    ) {}

    /**
     * A unique value representing the details for this card.
     *
     * Possibly this should be the only value stored for the card,
     * and the others are calculated on the fly.
     */
    get encoding(): number {
        return this.color  * Details.size ** 0 +
            this.shape     * Details.size ** 1 +
            this.quantity  * Details.size ** 2 +
            this.opacity   * Details.size ** 3
    }

    /**
     * The indexes of the cards given which make a valid set.
     * Returns false if a valid set can not be made.
     * O(n**3) >:(
     */
    public static getSet(cards: Card[]): CardSet | false {
        if(cards.length >= 3)
            for(let i = 0; i < cards.length; i++)
                for(let j = i + 1; j < cards.length; j++)
                    for(let k = j + 1; k < cards.length; k++)
                        if(Card.isSet(cards[i], cards[j], cards[k]))
                            return [cards[i], cards[j], cards[k]]
        return false
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
     *
     * @param encoding Number between 0 and total combinations
     */
    public static make = (encoding: number): Card =>
        new Card(
            Math.trunc(encoding / Details.size ** 0) % Details.size as Details.Color,
            Math.trunc(encoding / Details.size ** 1) % Details.size as Details.Shape,
            Math.trunc(encoding / Details.size ** 2) % Details.size as Details.Quantity,
            Math.trunc(encoding / Details.size ** 3) % Details.size as Details.Opacity,
        )

    /** A unique value comparing the difference in the card's details. */
    private static diff = (card1: Card, card2: Card): number =>
        +(card1.color == card2.color)       << 0 |
        +(card1.shape == card2.shape)       << 1 |
        +(card1.quantity == card2.quantity) << 2 |
        +(card1.opacity == card2.opacity)   << 3
}
