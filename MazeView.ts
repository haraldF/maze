import { Maze, TileType } from "./Maze";


export class MazeView {

    public G?: Map<number, number>;

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

        for (let y = 0; y < this.maze.height; ++y) {
            const row = this.maze.tiles[y];
            for (let x = 0; x < this.maze.width; ++x) {
                if (row[x] == TileType.Wall) {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(
                        x * tileWidth,
                        y * tileHeight,
                        tileWidth,
                        tileHeight)
                } else if (row[x] == TileType.Robot) {
                    ctx.fillStyle = "#00AA00";
                    ctx.fillRect(
                        x * tileWidth,
                        y * tileHeight,
                        tileWidth,
                        tileHeight)
                } else if (x === this.maze.width - 1 && y === this.maze.height - 1) {
                    ctx.fillStyle = "#0000FF";
                    ctx.fillRect(
                        x * tileWidth,
                        y * tileHeight,
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
}
