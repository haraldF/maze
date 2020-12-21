import { Action, ActionSpace, AllActions } from './ActionSpace';
import { State } from './State';

export const enum TileType {
    Empty,
    Wall,
    Robot
};

export class Maze {
    height: number;
    width: number;
    public steps = 0;

    public robotPosition;
    public allowedMoves = new Map<number, Array<Action>>();

    static EmptyMaze(width: number, height: number) {
        return Array.from(Array(height), () => Array(width).fill(TileType.Empty));
    }

    constructor(public readonly tiles: Array< Array<TileType> >) {
        this.height = tiles.length;
        this.width = tiles[0].length;

        tiles[0][0] = TileType.Robot;
        this.robotPosition = this.newState(0, 0);

        this.initAllowedMoves();
    }

    private newState(x: number, y: number): State {
        return {
            x,
            y,
            index: x * this.width + y,
            applied: (action: Action) => this.applied(action, x, y)
        }
    }

    private applied(action: Action, x: number, y: number): State {
        const move = ActionSpace[action];
        return this.newState(x + move.x, y + move.y);
    }

    private getNewPosition(action: Action) {
        return this.robotPosition.applied(action);
    }

    isAllowedMove(state: State, action: Action): boolean {

        const targetPosition = state.applied(action);

        if (targetPosition.x < 0 || targetPosition.y < 0
            || targetPosition.x >= this.height || targetPosition.y >= this.width)
            return false;

        return this.tiles[targetPosition.x][targetPosition.y] !== TileType.Wall;
    }

    // encodes the current maze to a base64 string
    encodeTiles(): string {
        let bytes = String.fromCharCode(this.width, this.height);

        let bit = 0;
        let currentByte = 0;
        for (let x = 0; x < this.height; ++x) {
            for (let y = 0; y < this.width; ++y) {
                if (this.tiles[x][y] === TileType.Wall) {
                    currentByte |= 1;
                }

                if (++bit === 8) {
                    bytes += String.fromCharCode(currentByte);
                    bit = 0;
                    currentByte = 0;
                } else {
                    currentByte <<= 1;
                }
            }
        }

        if (bit !== 0) {
            bytes += String.fromCharCode(currentByte << 7 - bit);
        }

        return btoa(bytes);
    }

    static loadTiles(encodedString: string): Array<Array<TileType>> {
        const bytes = atob(encodedString);

        let currentByteIndex = 0;
        const width = bytes.charCodeAt(currentByteIndex++);
        const height = bytes.charCodeAt(currentByteIndex++);

        const tiles = Maze.EmptyMaze(width, height);

        let currentByte = bytes.charCodeAt(currentByteIndex++);
        let bit = 0;
        for (let x = 0; x < height; ++x) {
            for (let y = 0; y < width; ++y) {
                tiles[x][y] = ((currentByte & 128) === 128) ? TileType.Wall : TileType.Empty;
                if (++bit === 8) {
                    currentByte = bytes.charCodeAt(currentByteIndex++);
                    bit = 0;
                } else {
                    currentByte <<= 1;
                }
            }
        }

        return tiles;
    }

    private initAllowedMoves() {
        this.allowedMoves.clear();
        for (let x = 0; x < this.height; ++x) {
            for (let y = 0; y < this.width; ++y) {
                const state = this.newState(x, y);
                const allowedMoves = AllActions.filter(action =>
                    this.isAllowedMove(state, action)
                );
                this.allowedMoves.set(state.index, allowedMoves);
            }
        }
    }

    toggleTile(row: number, column: number) {
        if ((row === 0 && column === 0) || (row === this.height - 1 && column == this.width - 1)) {
            return;
        }

        this.tiles[row][column] = this.tiles[row][column] === TileType.Wall ? TileType.Empty : TileType.Wall;
        this.initAllowedMoves();
    }

    updateMaze(action: Action) {
        this.tiles[this.robotPosition.x][this.robotPosition.y] = TileType.Empty;
        this.robotPosition = this.getNewPosition(action);
        ++this.steps;
        this.tiles[this.robotPosition.x][this.robotPosition.y] = TileType.Robot;
    }

    isGameOver() {
        return this.robotPosition.x === this.height - 1 && this.robotPosition.y === this.width - 1;
    }

    getState() { return this.robotPosition; }

    getAllowedMoves(state: State) {
        return this.allowedMoves.get(state.index);
    }

    getReward() {
        return this.isGameOver() ? 0 : -1;
    }

    reset() {
        this.steps = 0;
        this.tiles[this.robotPosition.x][this.robotPosition.y] = TileType.Empty;
        this.tiles[0][0] = TileType.Robot;
        this.robotPosition = this.newState(0, 0);
    }

    setRobotPosition(x: number, y: number) {
        const newPos = this.newState(x, y);
        this.tiles[this.robotPosition.x][this.robotPosition.y] = TileType.Empty;
        this.robotPosition = newPos;
        this.tiles[this.robotPosition.x][this.robotPosition.y] = TileType.Robot;
    }

    toIndex(x: number, y: number): number {
        return x * this.width + y;
    }

    resize(width: number, height: number) {
        this.reset();

        for (let i = this.height; i < height; ++i) {
            this.tiles.push(new Array(width).fill(TileType.Empty));
        }
        this.tiles.length = height;
        this.height = height;

        for (let row of this.tiles) {
            row.length = width;
            row.fill(TileType.Empty, this.width);
        }
        this.width = width;

        this.initAllowedMoves();
    }
};
