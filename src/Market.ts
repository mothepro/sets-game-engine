import Card, { CardSet } from './Card.js'

export default class Market {

  protected cards_: Card[] = []

  protected lastSolution?: CardSet | false

  /**
   * The cards which make a possible valid set or false if a valid set can not be made.
   * O(n**3) >:(
   */
  get solution(): CardSet | false {
    if (this.lastSolution == undefined) {
      this.lastSolution = false
      const cards = this.cards_.filter(card => !!card) // clean version
      if (cards.length >= 3)
        for (let i = 0; i < cards.length; i++)
          for (let j = i + 1; j < cards.length; j++)
            for (let k = j + 1; k < cards.length; k++)
              if (Card.isSet(cards[i], cards[j], cards[k])) {
                this.lastSolution = [cards[i], cards[j], cards[k]]
                break
              }
    }
    return this.lastSolution
  }

  get cards(): ReadonlyArray<Card> {
    return this.cards_
  }

  get isPlayable(): boolean {
    return !!this.solution
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
    delete this.lastSolution
  }

  /** Removes a set from the deck, leaving empty spots and clears the solution */
  popSet(...cards: CardSet): CardSet {
    const ret = []
    for (const card of cards) {
      ret.push(card)
      delete this.cards_[this.cards_.indexOf(card)]
    }
    delete this.lastSolution

    return ret as CardSet
  }

  /** Throws if a given card doesn't exist in the market */
  assert(...cards: Card[]) {
    for (const card of cards)
      if (!this.cards_.includes(card))
        throw Error(`Card ${card} doesn't exist in the market`)
  }

  /** Removes empty spots in deck */
  cleanUp() {
    this.cards_ = this.cards_.filter(card => card instanceof Card)
  }
}
