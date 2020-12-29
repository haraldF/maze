import { Maze, TileType } from "./Maze";

export class MazeView {

    private G?: Map<number, number>;
    private visited?: Set<number>;

    constructor(public readonly maze: Maze, public readonly canvas: HTMLCanvasElement) {}

    render() {
        this.renderMaze();
        if (this.G !== undefined) {
            this.renderGValues(this.G);
        }
    }

    renderMaze() {
        const ctx = this.canvas.getContext('2d')!;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.renderGrid(ctx);

        const tileWidth = this.canvas.width / this.maze.width;
        const tileHeight = this.canvas.height / this.maze.height;

        for (let x = 0; x < this.maze.height; ++x) {
            const row = this.maze.tiles[x];
            for (let y = 0; y < this.maze.width; ++y) {
                if (row[y] == TileType.Wall) {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(
                        y * tileWidth,
                        x * tileHeight,
                        tileWidth,
                        tileHeight)
                } else if (row[y] == TileType.Robot) {
                    ctx.fillStyle = "#00AA00";
                    ctx.fillRect(
                        y * tileWidth,
                        x * tileHeight,
                        tileWidth,
                        tileHeight)
                } else if (y === this.maze.width - 1 && x === this.maze.height - 1) {
                    ctx.fillStyle = "#0000FF";
                    ctx.fillRect(
                        y * tileWidth,
                        x * tileHeight,
                        tileWidth,
                        tileHeight)
                } else if (this.visited?.has(this.maze.toIndex(x, y))) {
                    ctx.fillStyle = "#eeeeee";
                    ctx.fillRect(
                        y * tileWidth,
                        x * tileHeight,
                        tileWidth,
                        tileHeight)
                }
            }
        }
    }

    private renderGrid(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.strokeStyle = "grey";
        for (let i = 0; i < this.maze.height + 1; ++i) {
            const y = (this.canvas.height / this.maze.height) * i;
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
        }
        for (let i = 0; i < this.maze.width + 1; ++i) {
            const x = (this.canvas.width / this.maze.width) * i;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
        }
        ctx.stroke();
    }

    renderGValues(G: Map<number, number>) {
        const ctx = this.canvas.getContext('2d')!;

        const tileWidth = this.canvas.width / this.maze.width;
        const tileHeight = this.canvas.height / this.maze.height;

        ctx.font = '30px serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'middle';

        for (let row = 0; row < this.maze.height; ++row) {
            for (let column = 0; column < this.maze.width; ++column) {
                const index = this.maze.toIndex(column, row);
                const gValue = G.get(index)!;

                ctx.fillText(gValue.toFixed(4), row * tileWidth + tileWidth / 2, column * tileHeight + tileHeight / 2, tileWidth);
            }
        }
    }

    solve(G: Map<number, number>) {
        const visited = new Set<number>([0]);
        let state = this.maze.getState();

        while (state.x !== this.maze.height -1 || state.y !== this.maze.width - 1) {
            const allowedMoves = this.maze.getAllowedMoves(state)!;
            const bestMoveIndex = allowedMoves.map(action =>
                this.maze.applied(action, state.x, state.y)
            ).map(state =>
                visited.has(state.index) ? undefined : G.get(state.index)
            ).reduce((maxIndex: number, currentValue, index, array) => {
                if (currentValue !== undefined && (maxIndex === -1 || array[maxIndex]! < currentValue)) {
                    return index;
                }
                return maxIndex;
            }, -1);

            if (bestMoveIndex === -1) // no best move - maze not solvable. Freak out
                break;


            state = this.maze.applied(allowedMoves[bestMoveIndex], state.x, state.y);
            visited.add(state.index);
        }

        return visited;
    }

    setG(G: Map<number, number>) {
        this.G = G;
        this.visited = this.solve(G);
    }
}
