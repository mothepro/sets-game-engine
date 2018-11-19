import Card, {Set} from './Card'

export default class Market {
    /** The number of cards that are shown in the market. */
    protected static readonly SIZE = 9

    protected cards_: Card[] = []

    get cards(): ReadonlyArray<Card> {
        return this.cards_
    }

    get isPlayable(): boolean {
        return !!Card.getSet(this.cards_.filter(card => !!card))
    }

    get isFull(): boolean {
        return this.isPlayable
            && this.cards_.filter(card => !!card).length >= Market.SIZE
    }

    /** Adds cards to market, also filling up any empty spots */
    pushCards(cards: Set.Cards) {
        for (let i = 0; cards.length && i < this.cards_.length; i++)
            if (this.cards_[i] == undefined)
                this.cards_[i] = cards.shift()!
        if (cards.length)
            this.cards_.push(...cards)
    }

    /** Removes a set from the deck, leaving empty spots */
    popSet(...indexs: Set.Indexs): Set.Cards {
        const ret = []
        for(const index of indexs) {
            ret.push(this.cards_[index])
            delete this.cards_[index]
        }

        return ret as Set.Cards
    }

    /** Removes empty spots in deck */
    cleanUp() {
        this.cards_ = this.cards_.filter(card => card instanceof Card)
    }
}
