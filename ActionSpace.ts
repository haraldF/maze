export const enum Action {
    Up, Down, Left, Right
};

export type Actions = keyof typeof Action;

export const AllActions = [ Action.Up, Action.Down, Action.Left, Action.Right ];

export const ActionSpace: { [key in Action] : { x: number, y: number } } = {
    [Action.Up]: { x: -1, y: 0 },
    [Action.Down]: { x: 1, y: 0 },
    [Action.Left]: { x: 0, y: -1 },
    [Action.Right]: { x: 0, y: 1 }
};
