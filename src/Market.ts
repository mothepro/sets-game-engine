import Card, {CardSet} from './Card'

export default class Market {

    protected cards_: Card[] = []

    get cards(): ReadonlyArray<Card> {
        return this.cards_
    }

    get isPlayable(): boolean {
        return !!Card.getSet(this.cards_.filter(card => !!card))
    }

    get isFull(): boolean {
        return this.isPlayable &&
            this.cards_.filter(card => !!card).length >= 9 // Minimum number of cards that should be in the market
    }

    /** Adds cards to market, also filling up any empty spots */
    pushCards(...cards: CardSet) {
        for (let i = 0; cards.length && i < this.cards_.length; i++)
            if (this.cards_[i] == undefined)
                this.cards_[i] = cards.shift()!
        if (cards.length)
            this.cards_.push(...cards)
    }

    /** Removes a set from the deck, leaving empty spots */
    popSet(...cards: CardSet): CardSet {
        const ret = []
        for(const card of cards) {
            ret.push(card)
            delete this.cards_[this.cards_.indexOf(card)]
        }

        return ret as CardSet
    }

    /** Throws if a given card doesn't exist in the market */
    public assert(cards: Card[]) {
        for (const card of cards)
            if (!this.cards_.includes(card))
                throw Error(`Card ${card} doesn't exist in the market`)
    }

    /** Removes empty spots in deck */
    cleanUp() {
        this.cards_ = this.cards_.filter(card => card instanceof Card)
    }
}
