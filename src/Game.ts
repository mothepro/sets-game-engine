import { SafeEmitter, SafeSingleEmitter } from 'fancy-emitter'
import Player from './Player.js'
import Card, { CardSet } from './Card.js'
import allUniqueCards from './allUniqueCards.js'

const isIterable = (arg: any): arg is Iterable<any> => Symbol.iterator in arg

export default class Game {
  static readonly MARKET_MINIMUM = 9

  static readonly MARKET_INCREASE = 3

  protected lastSolution?: CardSet | false

  protected readonly deck: Iterator<Card>

  /** Activated once the game is completed. */
  readonly finished = new SafeSingleEmitter

  /** Activated when the market has new cards in it. */
  readonly filled = new SafeEmitter

  /** The playable cards in the market. */
  cards: Card[] = []

  get maxScore(): number {
    return this.players.reduce((maxScore, player) => Math.max(maxScore, player.score), 0)
  }

  /** Currently winning players. */
  get winners(): readonly Player[] {
    return this.players.filter(player => player.score == this.maxScore)
  }

  /**
   * The cards which make a possible valid set or false if a valid set can not be made.
   * O(n**3) >:(
   */
  get solution(): CardSet | false {
    if (this.lastSolution === undefined) {
      this.lastSolution = false
      const cards = this.cards.filter(card => !!card) // clean version
      if (cards.length >= 3)
        for (let i = 0; i < cards.length - 2; i++)
          for (let j = i + 1; j < cards.length - 1; j++)
            for (let k = j + 1; k < cards.length; k++)
              if (Card.isSet(cards[i], cards[j], cards[k])) {
                this.lastSolution = [cards[i], cards[j], cards[k]]
                break
              }
    }
    return this.lastSolution
  }

  constructor(
    /** Players in the game. */
    readonly players: Player[] = [new Player],
    /** All cards to use in the deck. */
    deck: Iterable<Card> | Iterator<Card> = allUniqueCards()
  ) {
    // If an array is given, only go thru it once.
    this.deck = isIterable(deck)
      ? deck[Symbol.iterator]()
      : deck
    this.prepareMarket()
  }

  /**
   * If possible, move a set from tha.e market to a player.
   * If not, ban the player from taking any sets for `this.timeout`.
   * Throws if a given card doesn't exist in the market.
   * @returns true iff a set was taken.
   */
  takeSet(player: Player, ...cards: CardSet): boolean {
    for (const card of cards)
      if (!this.cards.includes(card))
        throw Error(`Card ${card} doesn't exist in the market.`)

    if (!player.isBanned) {
      if (Card.isSet(...cards)) {
        delete this.lastSolution
        // Remove cards from market in place
        for (const card of cards)
          delete this.cards[this.cards.indexOf(card)]
        // Clear hints for all when market updates
        for (const player of this.players)
          player.hintClear.activate()
        player.take.activate(cards)
        this.prepareMarket()
        return true
      } else
        player.ban.activate(player.timeout)
    }
    return false
  }

  /**
   * Adds a new card to the `hint` property if possible.
   * @returns true iff a new cards was added the the `hint` property.
   */
  getNewHint(player: Player): boolean {
    if (this.solution) {
      const ungivenHints = this.solution.filter(card => !player.hintCards.includes(card))
      if (ungivenHints.length)
        player.hint.activate(ungivenHints[Math.floor(Math.random() * ungivenHints.length)])
      return !!ungivenHints.length
    }
    return false
  }

  /** Prepares the market for another turn. */
  private prepareMarket(): void {
    this.fillMarket()

    // Removes empty spots in market.
    this.cards = this.cards.filter(card => card instanceof Card)

    // Game over if we can't find a solution
    if (this.solution)
      this.filled.activate()
    else
      this.finished.activate()
  }

  /** Fill the market with cards from the deck. */
  private fillMarket() {
    // The market needs to reach the minimum AND have a solution
    while (this.cards.filter(card => !!card).length < Game.MARKET_MINIMUM || !this.solution) {
      delete this.lastSolution // the last solution no longer means anything

      // Get the next cards from generator
      for (let i = 0; i < Game.MARKET_INCREASE; i++) {
        const { value, done } = this.deck.next()
        if (done)
          return
        this.pushMarket(value)
      }
    }
  }

  /** Add a card to the market. Fill empty slots first, otherwise just push at end. */
  private pushMarket(card: Card) {
    let inPlaceInsersation = false
    for (const [index, spot] of this.cards.entries())
      if (spot == undefined)
        return this.cards[index] = card
    if (!inPlaceInsersation)
      this.cards.push(card)
  }
}
