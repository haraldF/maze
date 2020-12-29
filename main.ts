import { Agent } from "./Agent";
import { Maze, TileType } from "./Maze";

// Plotly is imported globally, so just import its type declaration
// so we get code completion and type checking.
import type * as PlotlyType from 'plotly.js';
import { MazeView } from "./MazeView";
declare const Plotly: typeof PlotlyType;

const urlParams = new URLSearchParams(window.location.search);

function defaultMaze(): Array<Array<TileType>> {
    const tiles = Maze.EmptyMaze(6, 6);

    // 5, :5
    tiles[5][0] = TileType.Wall;
    tiles[5][1] = TileType.Wall;
    tiles[5][2] = TileType.Wall;
    tiles[5][3] = TileType.Wall;
    tiles[5][4] = TileType.Wall;

    // :4, 5
    tiles[0][5] = TileType.Wall;
    tiles[1][5] = TileType.Wall;
    tiles[2][5] = TileType.Wall;
    tiles[3][5] = TileType.Wall;

    // 2, 2:
    tiles[2][2] = TileType.Wall;
    tiles[2][3] = TileType.Wall;
    tiles[2][4] = TileType.Wall;
    tiles[2][5] = TileType.Wall;

    // 3, 2
    tiles[3][2] = TileType.Wall;

    return tiles;
}

function initTiles(): Array<Array<TileType>> {
    const savedMaze = urlParams.get("maze");

    if (savedMaze === null) {
        return defaultMaze();
    }

    return Maze.loadTiles(savedMaze);
}

const tiles = initTiles();
const maze = new Maze(tiles);

const canvas = document.getElementById("maze") as HTMLCanvasElement;
const mazeView = new MazeView(maze, canvas);
mazeView.render();

function resizeCanvas() {
    const dpr = window.devicePixelRatio;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    mazeView.render();
}
resizeCanvas();

window.addEventListener("resize", resizeCanvas, false);

function updateURI() {
    window.history.replaceState(null, "Maze", "?maze=" + encodeURIComponent(maze.encodeTiles()));
}

canvas.onclick = (event) => {

    const rect = canvas.getBoundingClientRect()

    const row = Math.floor(event.offsetY * maze.height / rect.width);
    const column = Math.floor(event.offsetX * maze.width / rect.height);

    maze.toggleTile(row, column);
    mazeView.render();

    updateURI();
}

async function sleep(timeout: number) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

function plotMoveHistory(moveHistory: Array<number>) {
    const trace1 = {
        x: moveHistory.map((_, i) => i),
        y: moveHistory,
        mode: 'lines'
    };

    const data = [ trace1 ];

    const layout: Partial<PlotlyType.Layout> = {
        title: 'Move History',
        xaxis: {
            title: "Episodes"
        },
        yaxis: {
            title: "StepCount"
        }
    };

    Plotly.newPlot('plot', data, layout);
}

async function start() {

    const alpha = parseFloat((document.getElementById("alpha") as HTMLInputElement).value)
    if (alpha < 0 || alpha > 1) {
        console.error("Alpha must be between 0 and 1");
        return;
    }
    const epsilon = parseFloat((document.getElementById("epsilon") as HTMLInputElement).value)
    if (epsilon < 0 || epsilon > 1) {
        console.error("Epsilon must be between 0 and 1");
        return;
    }

    const moveHistory = new Array<number>();
    const states = Array.from(Array(maze.width * maze.height), (_, i) => i);
    const robot = new Agent(states, alpha, epsilon);
    for (let i = 0; i < 5000; ++i) {

        while (!maze.isGameOver()) {
            const state = maze.getState();
            const allowedMoves = maze.getAllowedMoves(state)!;
            const action = robot.chooseAction(state, allowedMoves);
            maze.updateMaze(action);
            const newState = maze.getState();
            const reward = maze.getReward();
            robot.updateStateHistory(newState, reward);

            if (maze.steps > 1000) {
                maze.setRobotPosition(maze.height -1, maze.width - 1);
            }
        }

        robot.learn();
        moveHistory.push(maze.steps);
        maze.reset();

        // maze.render(canvas);
        // renderGValues(canvas, robot.G, maze);
        // await sleep(1000);
    }

    mazeView.setG(robot.G);
    mazeView.render();
    plotMoveHistory(moveHistory);
}

document.getElementById("startButton")!.onclick = start;

const widthInput = document.getElementById("width") as HTMLInputElement;
const heightInput = document.getElementById("height") as HTMLInputElement;

widthInput.value = maze.width.toString();
heightInput.value = maze.height.toString();

function clamp(num: number, min: number, max: number): number {
    return num <= min ? min : num >= max ? max : num;
}

function resizeMaze() {
    const width = clamp(Number.parseInt(widthInput.value), 1, 127);
    const height = clamp(Number.parseInt(heightInput.value), 1, 127);

    maze.resize(width, height);
    mazeView.render();
    updateURI();
}

widthInput.oninput = resizeMaze;
heightInput.oninput = resizeMaze;
