import Card, {Quantity, Opacity, Shape, Color} from './Card'
import * as shuffle from 'shuffle-array'

export default class Deck {
    private cards: Card[] = []

    constructor() {
        for(let i = 0; i < Card.COMBINATIONS; i++)
            this.cards.push(Card.make(i))
        shuffle(this.cards)
    }
}