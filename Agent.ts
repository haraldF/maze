import { Action, ActionSpace } from './ActionSpace';
import { State } from './State';

export class Agent {

    public readonly G = new Map<number, number>();
    private stateHistory = new Array<[number, number]>([0, 0]);
    private randomFactor: number;

    constructor(states: Array<number>,
        public readonly alpha: number = 0.15,
        initialRandomFactor = 0.2) {
        this.randomFactor = initialRandomFactor;
        this.initReward(states);
    }

    chooseAction(state: State, allowedMoves: Array<Action>): Action {
        let nextMove: Action;
        let randomNumber = Math.random();
        if (randomNumber < this.randomFactor) {
            // exploratory move
            // picks a random move of all allowed moves
            const randomMoveIndex = Math.floor(Agent.getRandomNumber(0, allowedMoves.length));
            nextMove = allowedMoves[randomMoveIndex];
        } else {
            // exploitation move
            // picks the move with the highest G value
            const nextMoveIndex = allowedMoves
                .map(action => state.applied(action))
                .map(newState => newState.index)
                .map(index => this.G.get(index)!)
                .reduce((maxValueIndex, currentValue, index, array) => {
                    return currentValue > array[maxValueIndex] ? index : maxValueIndex;
                }, 0);

            nextMove = allowedMoves[nextMoveIndex];
        }

        return nextMove;
    }

    updateStateHistory(state: State, reward: number) {
        this.stateHistory.push([state.index, reward]);
    }

    learn() {
        let target = 0;

        for (let i = this.stateHistory.length - 1; i >= 0; --i) {
            const [state, reward] = this.stateHistory[i];
            const previousReward = this.G.get(state)!;
            this.G.set(state, previousReward + this.alpha * (target - previousReward));
            target += reward;
        }

        this.stateHistory = [];

        this.randomFactor -= 10e-5;
    }

    private initReward(states: Array<number>) {
        for (const state of states) {
            this.G.set(state, Agent.getRandomNumber(-1.0, -0.1));
        }
    }

    private static getRandomNumber(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }
}
