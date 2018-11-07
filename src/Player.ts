import {Set} from './Card'
import Game from './Game'
import { Events } from './events'

export default class Player {
    public game!: Game

    /** Sets taken from the Game. */
    public readonly sets: Set.Cards[] = []

    /** Whether not timed out from taking sets. */
    private banned = false

    constructor(
        public timeout: number = 1000,
        public timeoutIncrease: number = 0,
    ) {}

    /** Number of collected Sets. */
    public get score(): number {
        return this.sets.length
    }

    public get isBanned(): boolean {
        return this.banned
    }

    /** If possible, move a set from the market to a player. */
    public takeSet(...indexs: Set.Indexs): boolean {
        let ret = false

        if(!this.banned) {
            ret = this.game.checkSet(...indexs)

            if (ret)
                this.sets.push(this.game.removeSet(...indexs))
            else
                this.ban()
        }

        return ret
    }

    /** Bans the player from taking any sets. */
    private ban() {
        this.banned = true
        this.game.emit(Events.playerBanned, {player: this, timeout: this.timeout})

        setTimeout(() => {
            this.banned = false
            this.timeout += this.timeoutIncrease
            this.game.emit(Events.playerUnbanned, this)
        }, this.timeout)
    }
}
