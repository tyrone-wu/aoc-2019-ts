import Queue from 'yocto-queue';
import { IntcodeProgram, parseIntcodeProgram } from '../intcode';
import { IntPair } from '../utils';

const enum Direction {
  North = 1,
  South = 2,
  West = 3,
  East = 4,
}

const delta: Map<Direction, [number, number]> = new Map([
  [Direction.North, [0, -1]],
  [Direction.South, [0, 1]],
  [Direction.West, [-1, 0]],
  [Direction.East, [1, 0]],
]);

const enum Status {
  Wall = 0,
  Moved = 1,
  MovedO2 = 2,
}

const first = (input: string) => {
  const instructions = parseIntcodeProgram(input);

  const visited: Set<bigint> = new Set();
  const bfs: Queue<[number, number, number, IntcodeProgram]> = new Queue();
  bfs.enqueue([0, 0, 0, new IntcodeProgram(instructions)]);
  while (bfs.size > 0) {
    const [x, y, steps, program] = bfs.dequeue();
    if (visited.has(IntPair.hashIntPair(x, y))) {
      continue;
    }
    visited.add(IntPair.hashIntPair(x, y));

    for (const [dir, [dx, dy]] of delta) {
      const clone = program.clone();
      clone.in(dir);
      clone.run();
      const status = Number(clone.out());
      if (status === Status.Wall) {
        continue;
      } else if (status === Status.Moved) {
        bfs.enqueue([x + dx, y + dy, steps + 1, clone]);
      } else if (status === Status.MovedO2) {
        return steps + 1;
      } else {
        throw new Error(`invalid status: ${status}`);
      }
    }
  }

  return -1;
};

const expectedFirstSolution = -1;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function debug(map: Map<bigint, Status>): void {
  let x_min = Number.MAX_SAFE_INTEGER, x_max = Number.MIN_SAFE_INTEGER;
  let y_min = x_min, y_max = x_max;
  for (const hash of map.keys()) {
    const { x, y } = IntPair.fromHash(hash);
    x_min = Math.min(x_min, Number(x));
    x_max = Math.max(x_max, Number(x));
    y_min = Math.min(y_min, Number(y));
    y_max = Math.max(y_max, Number(y));
  }

  for (let y = y_min; y <= y_max; ++y) {
    const row: string[] = [];
    for (let x = x_min; x <= x_max; ++x) {
      const hash = IntPair.hashIntPair(x, y);
      const s = map.has(hash) ? (map.get(hash) === Status.Moved ? '.' : 'O') : ' ';
      row.push(s);
    }
    console.log(row.join(''));
  }
}

const second = (input: string) => {
  const instructions = parseIntcodeProgram(input);

  const map: Map<bigint, Status> = new Map();
  const bfs: Queue<[number, number, number, IntcodeProgram, Status]> = new Queue();
  bfs.enqueue([0, 0, 0, new IntcodeProgram(instructions), Status.Moved]);
  let o2Pos: [number, number];
  while (bfs.size > 0) {
    const [x, y, steps, program, statusAt] = bfs.dequeue();
    const hash = IntPair.hashIntPair(x, y);
    if (map.has(hash)) {
      continue;
    }
    map.set(hash, statusAt);

    for (const [dir, [dx, dy]] of delta) {
      const clone = program.clone();
      clone.in(dir);
      clone.run();
      const status = Number(clone.out());
      if (status === Status.Wall) {
        continue;
      } else if (status === Status.Moved || status === Status.MovedO2) {
        bfs.enqueue([x + dx, y + dy, steps + 1, clone, status as Status]);
        if (status === Status.MovedO2) {
          o2Pos = [x + dx, y + dy];
        }
      } else {
        throw new Error(`invalid status: ${status}`);
      }
    }
  }

  const visited2: Set<bigint> = new Set();
  const bfs2: Queue<[[number, number], number]> = new Queue();
  bfs2.enqueue([o2Pos, 0]);
  let minutes = 0;
  while (bfs2.size > 0) {
    const [[x, y], min] = bfs2.dequeue();
    const hash = IntPair.hashIntPair(x, y);
    if (!map.has(hash) || visited2.has(hash)) {
      continue;
    }
    visited2.add(hash);
    minutes = Math.max(minutes, min);

    for (const [dx, dy] of delta.values()) {
      bfs2.enqueue([[x + dx, y + dy], min + 1]);
    }
  }
  return minutes;
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
