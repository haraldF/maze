import { Action, ActionSpace } from './ActionSpace';

export interface State {
    readonly x: number;
    readonly y: number;
    readonly index: number;

    /// Apply action to this state and return a the resulting state
    applied: (action: Action) => State;
}
