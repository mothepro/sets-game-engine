import { SafeEmitter, SafeSingleEmitter } from 'fancy-emitter'
import shuffle from './shuffle.js'
import Player from './Player.js'
import Card, { CardSet } from './Card.js'
import { COMBINATIONS } from './Details.js'

export default class Game {
  static readonly MARKET_MINIMUM = 9

  static readonly MARKET_INCREASE = 3

  protected lastSolution?: CardSet | false

  /** Activated once the game is completed. */
  readonly finished = new SafeSingleEmitter

  /** Activated when the market has new cards in it. */
  readonly filled = new SafeEmitter

  playableCards: Card[] = []

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
      const cards = this.playableCards.filter(card => !!card) // clean version
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

  constructor(
    /** Players in the game. */
    readonly players: Player[] = [new Player],

    /** A random number generator for generating the cards. */
    rng = (max: number) => (Math.random() * max) >>> 0,

    /** All cards in deck. */
    protected readonly cards: Card[] = [...Array(COMBINATIONS)].map((_, i) => Card.make(i))
  ) {
    shuffle(this.cards, rng)
    this.fillMarket()
  }

  /**
   * If possible, move a set from the market to a player.
   * If not, ban the player from taking any sets for `this.timeout`.
   * Throws if a given card doesn't exist in the market.
   * @returns true iff a set was taken.
   */
  takeSet(player: Player, ...cards: CardSet): boolean {
    for (const card of cards)
      if (!this.playableCards.includes(card))
        throw Error(`Card ${card} doesn't exist in the market.`)

    if (!player.isBanned) {
      if (Card.isSet(...cards)) {
        delete this.lastSolution
        // Remove cards from market in place
        for (const card of cards)
          delete this.playableCards[this.playableCards.indexOf(card)]
        // Clear hints for all when market updates
        for (const player of this.players)
          player.hintClear.activate()
        
        player.take.activate(cards)
        this.fillMarket()
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

  /** Fill the market with cards. */
  protected fillMarket(): void {
    // Move cards from deck to market 
    // The market needs to reach the minimum AND have a solution
    while (this.cards.length
      && (Game.MARKET_MINIMUM > this.playableCards.filter(card => !!card).length
        || !this.solution)) {
      const nextCards = this.cards.splice(0, Game.MARKET_INCREASE)
      for (let i = 0; nextCards.length && i < this.playableCards.length; i++)
        if (this.playableCards[i] == undefined)
          this.playableCards[i] = nextCards.shift()!
      if (nextCards.length)
        this.playableCards.push(...nextCards)
      delete this.lastSolution // the last solution no longer means anything
    }

    // Removes empty spots in market.
    this.playableCards = this.playableCards.filter(card => card instanceof Card)

    if (this.solution)
      this.filled.activate()
    else
      this.finished.activate()
  }
}
