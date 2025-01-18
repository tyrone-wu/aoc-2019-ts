import Queue from 'yocto-queue';
import { IntcodeProgram, parseIntcodeProgram } from '../intcode';
import { IntPair } from '../utils';

const enum Direction {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3,
  __MAX_DIRECTION = 4,
}

const delta: Map<Direction, [number, number]> = new Map([
  [Direction.Up, [0, -1]],
  [Direction.Right, [1, 0]],
  [Direction.Down, [0, 1]],
  [Direction.Left, [-1, 0]],
]);

function turnLeft(direction: Direction): Direction {
  return (direction - 1 + Direction.__MAX_DIRECTION) % Direction.__MAX_DIRECTION;
}

function turnRight(direction: Direction): Direction {
  return (direction + 1) % Direction.__MAX_DIRECTION;
}

class Robot {
  x: number;
  y: number;
  direction: Direction;

  constructor(x: number, y: number, dir: Direction) {
    this.x = x;
    this.y = y;
    this.direction = dir;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testInput = `#######...#####
#.....#...#...#
#.....#...#...#
......#...#...#
......#...###.#
......#.....#.#
^########...#.#
......#.#...#.#
......#########
........#...#..
....#########..
....#...#......
....#...#......
....#...#......
....#####......
`;

function parseMap(program: IntcodeProgram, verbose: boolean): [string[][], Robot] {
  const map: string[][] = [];
  const row: string[] = ['.'];
  let robot: Robot;

  // program.output = new Queue();
  // for (const char of testInput) {
  //   program.output.enqueue(BigInt(char.charCodeAt(0)));
  // }

  let y = 1;
  let x = 1;
  while (program.output.size > 0) {
    const char = String.fromCharCode(Number(program.out()));
    if (char !== '\n') {
      if (char !== '.' && char !== '#') {
        let dir: Direction;
        if (char === '^') {
          dir = Direction.Up;
        } else if (char === '>') {
          dir = Direction.Right;
        } else if (char === 'v') {
          dir = Direction.Down;
        } else if (char === '<') {
          dir = Direction.Left;
        } else {
          continue;
          throw new Error(`invalid direction: ${char}`);
        }
        robot = new Robot(x, y, dir);
      }
      row.push(char);
      ++x;
    } else {
      if (map.length === 0) {
        map.push(Array(row.length + 1).fill('.'));
      }
      if (row.length > 1) {
        row.push('.');
        map.push(row.slice());

        row.length = 1;
      }
      x = 1;
      ++y;
    }
  }
  map.push(Array(map[0].length).fill('.'));

  if (verbose) {
    for (const row of map) {
      console.log(row.join(''));
    }
    console.log('===');
  }
  return [map, robot];
}

const comma = ','.charCodeAt(0);
const newline = '\n'.charCodeAt(0);
const zero = '0'.charCodeAt(0);

class Move {
  readonly turn: string;
  steps: number;

  constructor(turn: string, steps: number) {
    this.turn = turn;
    this.steps = steps;
  }

  equals(other: Move): boolean {
    return this.turn === other.turn && this.steps === other.steps;
  }

  format(): [number, number, number] {
    return [
      this.turn.charCodeAt(0),
      comma,
      this.steps + zero,
    ];
  }

  debug(): void {
    console.log(this.format());
  }
}

function walkMap(instructions: Map<bigint, bigint>): [Map<bigint, number>, Move[]] {
  const program = new IntcodeProgram(new Map(instructions));
  program.run();
  const [map, start] = parseMap(program, false);

  const visited: Map<bigint, number> = new Map();
  const moves: Move[] = [];

  const bfs: Queue<Robot> = new Queue();
  bfs.enqueue(start);
  while (bfs.size > 0) {
    const { x, y, direction } = bfs.dequeue();
    const hash = IntPair.hashIntPair(x, y);
    visited.set(hash, 1 + (visited.get(hash) ?? 0));

    const [dxF, dyF] = delta.get(direction);
    if (map[y + dyF][x + dxF] === '#') {
      bfs.enqueue(new Robot(x + dxF, y + dyF, direction));
      moves[moves.length - 1].steps += 1;
    } else {
      const left = turnLeft(direction);
      const [dxL, dyL] = delta.get(left);

      const right = turnRight(direction);
      const [dxR, dyR] = delta.get(right);

      if (map[y + dyL][x + dxL] === '#') {
        bfs.enqueue(new Robot(x + dxL, y + dyL, left));
        moves.push(new Move('L', 1));
      } else if (map[y + dyR][x + dxR] === '#') {
        bfs.enqueue(new Robot(x + dxR, y + dyR, right));
        moves.push(new Move('R', 1));
      }
    }
  }

  return [visited, moves];
}

const first = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const visited = walkMap(instructions)[0];

  let sum = 0;
  for (const [hash, count] of visited.entries()) {
    if (count > 1) {
      const { x, y } = IntPair.fromHash(hash);
      sum += (Number(x) - 1) * (Number(y) - 1);
    }
  }
  return sum;
};

const expectedFirstSolution = 76;

const second = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const moves = walkMap(instructions)[1];

  // const isPrefix = (offset: number, func: Move[]): boolean => {
  //   for (let i = 0; i < func.length; ++i) {
  //     if (!func[i].equals(moves[i + offset])) {
  //       return false;
  //     }
  //   }
  //   return true;
  // };

  // const functions: Move[][] = [];
  // const func: Move[] = [];
  // for (let i = 0; i < moves.length; ++i) {
  //   if (functions.length === 3) {
  //     break;
  //   }

  //   func.push(moves[i]);
  //   for (let j = i + 1; j < moves.length; ++j) {
  //     if (!isPrefix(j, func)) {
  //       console.log(func);
  //       func.pop();
  //       functions.push([...func]);
  //       func.length = 0;
  //       break;
  //     }
  //   }
  // }

  const row = [];
  for (const mv of moves) {
    row.push(mv.turn);
    row.push(mv.steps);
  }
  console.log(row.join(','));

  const mainRoutine: string[] = ['A', 'B', 'B', 'A', 'B', 'C', 'A', 'C', 'B', 'C'];
  const A: string[] = ['L', '4', 'L', '6', 'L', '8', 'L', '12'];
  const B: string[] = ['L', '8', 'R', '12', 'L', '12'];
  const C: string[] = ['R', '12', 'L', '6', 'L', '6', 'L', '8'];

  const delimit = (arr: string[], d: string): string[] => {
    const delimitedArr: string[] = [];
    for (let i = 0; i < arr.length - 1; ++i) {
      delimitedArr.push(arr[i]);
      delimitedArr.push(d);
    }
    delimitedArr.push(arr[arr.length - 1]);
    return delimitedArr;
  };

  const program = new IntcodeProgram(instructions);
  program.program.set(0n, 2n);

  const addInput = (input: string[]) => {
    for (const f of delimit(input, ',')) {
      for (const c of f) {
        program.in(c.charCodeAt(0));
      }
    }
    program.in(newline);
  };

  addInput(mainRoutine);
  addInput(A);
  addInput(B);
  addInput(C);
  addInput(['n']);
  program.run();

  // parseMap(program, true);
  // program.debugOutput();
  while (program.output.size > 1) {
    program.out();
  }
  return program.out();
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
