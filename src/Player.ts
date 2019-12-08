import Card, { CardSet } from './Card.js'
import Game from './Game.js'

export default class Player {
  game!: Game

  /** Sets taken from the Game. */
  readonly sets: CardSet[] = []

  /** Cards which make up a set in the current market. */
  readonly hint: Card[] = []

  /** Number of wrong attempts */
  bans = 0

  /** Number of times a hint used */
  hints = 0

  /** Whether not timed out from taking sets. */
  private banned = false

  /** If positive, number of ms the user will be blocked for after a wrong attempt. */
  timeout!: number

  /** Number of collected Sets. */
  get score(): number {
    return this.sets.length
  }

  get isBanned(): boolean {
    return this.banned
  }

  /**
   * If possible, move a set from the market to a player.
   * If not, ban the player from taking any sets for `this.timeout`
   * @returns true iff a set was taken.
   */
  takeSet(...cards: CardSet): boolean {
    if (!this.banned) {
      if (this.game.check(...cards)) {
        const set = this.game.take(...cards)
        this.sets.push(set)
        this.game.marketGrab.activate(set)
        return true
      } else if (this.timeout) {
        setTimeout(() => {
          this.banned = false
          this.game.playerUnbanned.activate(this)
        }, this.timeout)

        this.banned = true
        this.bans++
        this.game.playerBanned.activate({ player: this, timeout: this.timeout })
      }
    }
    return false
  }

  /**
   * Adds a new card to the `hint` property if possible.
   * @returns true iff a new cards was added the the `hint` property.
   */
  getNewHint(): boolean {
    const ungivenHints = this.game.solution.filter(card => !this.hint.includes(card))
    if (ungivenHints.length) {
      this.hints++
      this.hint.push(ungivenHints[Math.floor(Math.random() * ungivenHints.length)])
    }
    return !!ungivenHints.length
  }
}
