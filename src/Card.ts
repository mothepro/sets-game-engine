
export enum Color { BLUE, RED, GREEN }
export enum Shape { SQUARE, CIRCLE, TRIANGLE }
export enum Quantity { ONE, TWO, THREE }
export enum Opacity { SOLID, HALF, EMPTY }

export const Details = [Color, Shape, Quantity, Opacity]

interface CardDetails {
    color: Color
    shape: Shape
    quantity: 1 | 2 | 3
    Opacity: 1 | 0.5 | 0
}

export default class Card {
    /**
     * Number of different combinations of cards.
     * the # of settings for each detail raised to the # of details. ( 3 ^ 4 )
     *
     * Or:
     *  (Object.keys(Color).length / 2) +
     *  (Object.keys(Shape).length / 2) +
     *  (Object.keys(Quantity).length / 2) +
     *  (Object.keys(Opacity).length / 2)
     */
    static readonly COMBINATIONS: number = 3 ** 4

    constructor(
        public readonly color: Color,
        public readonly shape: Shape,
        public readonly quantity: Quantity,
        public readonly opacity: Opacity,
    ) {}

    get encoding(): number {
        return this.color   * 3 ** 0 +
            this.shape      * 3 ** 1 +
            this.quantity   * 3 ** 2 +
            this.opacity    * 3 ** 3
    }

    /**
     * Build a Card using a single number as an encoding for Color, Shape, Quantity and Opacity.
     *
     * @param {number} encoding Number between 0 and total combinations
     */
    static make(encoding: number): Card {
        let enc = encoding % Card.COMBINATIONS
        const vals: number[] = []

        for(let i = 0; i < 4; i++) {
            vals.push(enc % 3)
            enc = Math.floor(enc / 3)
        }

        return new Card(
            vals[0] as Color,
            vals[1] as Shape,
            vals[2] as Quantity,
            vals[3] as Opacity,
        )
    }
}