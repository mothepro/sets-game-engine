import Card, {CardSet} from './Card'

export default class Market {

    protected cards_: Card[] = []

    get cards(): ReadonlyArray<Card> {
        return this.cards_
    }

    get isPlayable(): boolean {
        return !!Card.getSet(this.cards_)
    }

    get isFull(): boolean {
        return this.isPlayable &&
            this.cards_.length >= 9 // Minimum number of cards that should be in the market
    }

    public pushCards(...cards: CardSet) {
        this.cards_.push(...cards)
    }

    public popSet(...cards: CardSet): CardSet {
        this.assert(cards)

        const ret = []
        for(const card of cards) {
            ret.push(card)
            delete this.cards_[this.cards_.indexOf(card)]
        }

        // remove non cards_
        this.cards_ = this.cards_.filter(card => card instanceof Card)

        return ret as CardSet
    }

    /** Throws if a given card doesn't exist in the market */
    public assert(cards: Card[]) {
        for (const card of cards)
            if (!this.cards_.includes(card))
                throw Error(`Card ${card} doesn't exist in the market`)
    }
}
