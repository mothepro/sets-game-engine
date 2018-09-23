import Player from '../../src/Player'

export default class RealPlayer extends Player {
    constructor() {
        super(Math.random().toString(), 0, 0)
    }

    public getName(): string {
        return this.name
    }
}