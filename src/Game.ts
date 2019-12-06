import { SafeEmitter } from 'fancy-emitter'
import Market from './Market'
import Player from './Player'
import Card, { CardSet, Details } from './Card'
import { shuffle } from './util'

export default class Game {

  private readonly players_: Set<Player> = new Set

  private totalTime = 0

  private paused = true

  /** All cards in deck. */
  protected readonly cards: Card[] = []

  /** The cards shown the players. */
  protected readonly market = new Market

  /** Whether the game is started and currently being played. */
  protected inProgress = false

  /** When the game was paused, `undefined` when not paused. */
  private lastPause!: Date

  /** When the game is ready. */
  readonly started = new SafeEmitter

  /** When the game is completed. */
  readonly finished = new SafeEmitter

  /** When a player is banned. */
  readonly playerBanned = new SafeEmitter<{ player: Player, timeout: number }>()

  /** When a player is unbanned. */
  readonly playerUnbanned = new SafeEmitter<Player>()

  /** When a player is added to the game. */
  readonly playerAdded = new SafeEmitter<Player>()

  /** When the market has new cards in it. */
  readonly marketFilled = new SafeEmitter

  /** When cards are taken from the market. */
  readonly marketGrab = new SafeEmitter<CardSet>()

  constructor({ shoe = 1, rng, nextTimeout }: {
    /** Size of the deck. */
    shoe?: number,

    /** A random number generator for generating the cards. */
    rng?: (max: number) => number,

    /**
     * Calculate the next time out for a player.
     * When the game starts this function is used to set the timeout for each player.
     * The `oldTimeout` parameter is set to 0 for this case.
     */
    nextTimeout?: (oldTimeout: number, player: Player) => number,
  } = {}) {
    for (let i = 0; i < Details.combinations * shoe; i++)
      this.cards.push(Card.make(i))
    shuffle(this.cards, rng)

    if (nextTimeout)
      this.resetTimeouts(nextTimeout)
    this.clearHintsWhenMarketUpdated()
  }

  get isDeckEmpty(): boolean {
    return this.cards.length === 0
  }

  /** Whether any more sets can be made. */
  get isDone(): boolean {
    return this.isDeckEmpty && !this.market.isPlayable
  }

  get playableCards(): ReadonlyArray<Card> {
    return this.market.cards
  }

  get maxScore(): number {
    return this.players.reduce((maxScore, player) => Math.max(maxScore, player.score), 0)
  }

  get players(): Player[] {
    return [...this.players_]
  }

  /** Currently winning players. */
  get winners(): Player[] {
    return this.players.filter(player => player.score == this.maxScore)
  }

  get solution(): CardSet {
    if (!this.market.solution)
      throw Error('No hint can be given since a set can not be made.')
    return this.market.solution
  }

  get elapsedTime(): number {
    return this.totalTime + (this.paused ? 0 : Date.now() - this.lastPause.getTime())
  }

  /** Ready up. */
  async start() {
    this.started.activate()
    this.fillMarket()
    this.resume()
    await this.finished.next
    this.pause()
  }

  /**
   * The user switches focus away.
   * Save the total time taken.
   */
  pause() {
    if (!this.paused) {
      this.totalTime += (Date.now() - this.lastPause.getTime())
      this.paused = true
    }
  }

  /**
   * The user returns focus.
   * Save the current time of continue.
   */
  resume() {
    if (this.paused) {
      this.lastPause = new Date
      this.paused = false
    }
  }

  setCards(cards: Card[] | number[]) {
    if (this.inProgress)
      throw Error('Can not load cards into a game in progress')

    this.cards.length = 0
    for (let card of cards)
      this.cards.push(typeof card === 'number' ? Card.make(card) : card)
  }

  /** Adds a new player to the game before starting. */
  addPlayer(player: Player): this {
    if (!this.inProgress && !this.players_.has(player)) {
      player.game = this
      this.players_.add(player)
      this.playerAdded.activate(player)
    }
    return this
  }

  /** Whether a set of cards in the market is valid to take. */
  check(...cards: CardSet): boolean {
    this.market.assert(...cards)
    return Card.isSet(...cards)
  }

  /** Returns and removes some cards from the market. Updates market. */
  take(...cards: CardSet): CardSet {
    const ret = this.market.popSet(...cards)
    this.fillMarket()
    return ret
  }

  /** Fill the market with cards. */
  protected fillMarket(): void {
    while (this.cards.length && !this.market.isFull)
      this.market.pushCards(...this.cards.splice(0, 3) as CardSet)
    this.market.cleanUp()
    this.inProgress = !this.isDone
      ; (this.inProgress ? this.marketFilled : this.finished).activate()
  }

  private async clearHintsWhenMarketUpdated() {
    for await (let _ of this.marketGrab)
      for (const player of this.players_)
        player.hint.length = 0
  }

  private async resetTimeouts(nextTimeout: NonNullable<NonNullable<ConstructorParameters<typeof Game>[0]>['nextTimeout']>) {
    await this.started.next
    for (const player of this.players_)
      player.timeout = nextTimeout(0, player)
    for await (const { player, timeout } of this.playerBanned)
      player.timeout = nextTimeout(timeout, player)
  }
}
