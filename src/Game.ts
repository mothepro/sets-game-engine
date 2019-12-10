import { SafeEmitter, SafeSingleEmitter } from 'fancy-emitter'
import Player from './Player.js'
import Card, { CardSet } from './Card.js'

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

  /** The market, including gaps and all */
  private readonly market: Card[] = []

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
      if (this.cards.length >= 3)
        for (let i = 0; i < this.cards.length - 2; i++)
          for (let j = i + 1; j < this.cards.length - 1; j++)
            for (let k = j + 1; k < this.cards.length; k++)
              if (Card.isSet(this.cards[i], this.cards[j], this.cards[k])) {
                this.lastSolution = [this.cards[i], this.cards[j], this.cards[k]]
                break
              }
    }
    return this.lastSolution
  }

  /** The playable cards in the market. */
  get cards(): readonly Card[] {
    return this.market.filter(card => card instanceof Card)
  }

  constructor(
    /** Players in the game. */
    readonly players: Player[] = [new Player],
    /** All cards to use in the deck. */
    deck: Iterable<Card> | Iterator<Card> = Card.randomAll()
  ) {
    // If an array is given, only go thru it once.
    this.deck = isIterable(deck)
      ? deck[Symbol.iterator]()
      : deck
    this.prepareMarket()
  }

  /**
   * Attempts to take a set from the market on behalf of `player`.
   * If the set is valid and player is not banned, remove the card from the market
   * Clear all player's hints, activate the taker and prepare the next market.
   * If the set is invalid, ban the player.
   * Throws if a given card doesn't exist in the market.
   * @returns true iff a set was successfully taken.
   */
  takeSet(player: Player, cards: CardSet): boolean {
    if (cards.filter(x => !this.market.includes(x)).length)
      throw Error(`Some of the following cards don't exist in the market: ${cards}`)

    if (!player.isBanned) {
      if (Card.isSet(...cards)) {
        // Remove cards from market in place
        for (const card of cards)
          delete this.market[this.market.indexOf(card)]
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
   * Attempts some indexs in the market on behalf of `player`.
   * If the set is valid and player is not banned, remove the card from the market
   * Clear all player's hints, activate the taker and prepare the next market.
   * If the set is invalid, ban the player.
   * Throws if a given market index doesn't have a card.
   * @returns true iff a set was taken.
   */
  takeFromMarket = (player: Player, indexes: [number, number, number]) =>
    this.takeSet(player, this.market.filter((_, index) => indexes.includes(index)) as CardSet)

  /**
   * Adds a new card to the `hint` property if possible.
   * @returns true iff a new cards was added the the `hint` property.
   */
  takeHint(player: Player): boolean {
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

    // Game over if we can't find a solution
    if (this.solution)
      this.filled.activate()
    else
      this.finished.activate()
  }

  /** Fill the market with cards from the deck. Clears the solution each time. */
  private fillMarket() {
    delete this.lastSolution
    // The market needs to reach the minimum AND have a solution
    while (this.cards.length < Game.MARKET_MINIMUM || !this.solution) {
      // Get the next cards from generator
      for (let i = 0; i < Game.MARKET_INCREASE; i++) {
        const { value, done } = this.deck.next()
        if (done)
          return
        this.pushMarket(value)
      }
      delete this.lastSolution
    }
  }

  /** Add a card to the market. Fill empty slots first, otherwise just push at end. */
  private pushMarket(card: Card) {
    let inPlaceInsersation = false
    for (const [index, spot] of this.cards.entries())
      if (spot == undefined)
        return this.market[index] = card
    if (!inPlaceInsersation)
      this.market.push(card)
  }
}
