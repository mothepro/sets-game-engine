import {Set} from './Card'
import Game from './Game'

export default class Player {
    public readonly sets: Set[] = []
    public game: Game
    constructor(public readonly name: string) {}
}
