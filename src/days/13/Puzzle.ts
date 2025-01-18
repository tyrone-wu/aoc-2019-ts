import { IntcodeProgram, parseIntcodeProgram } from '../intcode';
import { IntPair } from '../utils';

const enum Tile {
  Empty = 0,
  Wall = 1,
  Block = 2,
  HorPaddle = 3,
  Ball = 4,
}

function drawScreen(program: IntcodeProgram, screen: Map<bigint, number>): void {
  while (program.output.size > 0) {
    const x = program.out();
    const y = program.out();
    const out = Number(program.out());
    const hash = IntPair.hashIntPair(x, y);
    screen.set(hash, out);
  }
}

function blockTiles(screen: Map<bigint, number>): number {
  let blocks = 0;
  for (const tile of screen.values()) {
    if (tile === Tile.Block) {
      ++blocks;
    }
  }
  return blocks;
}

const first = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const program = new IntcodeProgram(instructions);
  program.run();
  const screen: Map<bigint, number> = new Map();
  drawScreen(program, screen);
  return blockTiles(screen);
};

const expectedFirstSolution = -1;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function debugScreen(screen: Map<bigint, number>): void {
  let x_max = 0, y_max = 0;
  for (const hash of screen.keys()) {
    const coord = IntPair.fromHash(hash);
    x_max = Math.max(x_max, Number(coord.x));
    y_max = Math.max(y_max, Number(coord.y));
  }

  for (let y = 0n; y <= y_max; ++y) {
    const row: string[] = [];
    for (let x = 0n; x <= x_max; ++x) {
      const t = screen.get(IntPair.hashIntPair(x, y));
      let s: string;
      if (t === Tile.Empty) {
        s = ' ';
      } else if (t === Tile.Wall) {
        s = '|';
      } else if (t === Tile.Block) {
        s = '#';
      } else if (t === Tile.HorPaddle) {
        s = 'T';
      } else if (t === Tile.Ball) {
        s = 'O';
      } else {
        throw new Error(`invalid tile: ${t} at ${x},${y}`);
      }
      row.push(s);
    }
    console.log(row.join(''));
  }

  const score = screen.get(IntPair.hashIntPair(-1, 0));
  console.log(`score: ${score}`);
}

const enum Joystick {
  Left = -1,
  Neutral = 0,
  Right = 1,
}

function findPosition(screen: Map<bigint, number>, target: Tile.HorPaddle | Tile.Ball): IntPair {
  for (const [hash, tile] of screen) {
    if (tile === target) {
      return IntPair.fromHash(hash);
    }
  }
  return undefined;
}

const second = (input: string) => {
  const instructions = parseIntcodeProgram(input);

  const program = new IntcodeProgram(instructions);
  program.program.set(0n, 2n);
  const screen: Map<bigint, number> = new Map();;
  do {
    program.run();
    drawScreen(program, screen);
    // debugScreen(screen);

    const ballX = findPosition(screen, Tile.Ball).x;
    const paddleX = findPosition(screen, Tile.HorPaddle).x;

    let move: Joystick;
    if (ballX < paddleX) {
      move = Joystick.Left;
    } else if (ballX > paddleX) {
      move = Joystick.Right;
    } else {
      move = Joystick.Neutral;
    }
    program.in(BigInt(move));
  } while (blockTiles(screen) > 0);

  return screen.get(IntPair.hashIntPair(-1, 0));
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
