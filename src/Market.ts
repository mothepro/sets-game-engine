import Card, {Set} from './Card'

export default class Market {
    /** The number of cards that are shown in the market. */
    protected static readonly SIZE = 9

    protected cards_: Card[] = []

    get cards(): ReadonlyArray<Card> {
        return this.cards_
    }

    get isPlayable(): boolean {
        return !!Card.getSet(this.cards_)
    }

    get isFull(): boolean {
        return this.isPlayable && this.cards_.length >= Market.SIZE
    }

    public pushCards(...cards: Set.Cards) {
        this.cards_.push(...cards)
    }

    public popSet(...indexs: Set.Indexs): Set.Cards {
        const ret = []
        for(const index of indexs) {
            ret.push(this.cards_[index])
            delete this.cards_[index]
        }

        // remove non cards_
        this.cards_ = this.cards_.filter(card => card instanceof Card)

        return ret as Set.Cards
    }
}
