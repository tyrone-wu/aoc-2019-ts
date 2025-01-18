import { IntcodeProgram, parseIntcodeProgram } from '../intcode';
import { IntPair } from '../utils';

const enum Direction {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3,
  __MAX_DIRECTION = 4,
}

const delta: Map<Direction, [bigint, bigint]> = new Map([
  [Direction.Up, [0n, -1n]],
  [Direction.Right, [1n, 0n]],
  [Direction.Down, [0n, 1n]],
  [Direction.Left, [-1n, 0n]],
]);

function paintRegistrationId(input: string, painted: Map<bigint, bigint>): void {
  const instructions = parseIntcodeProgram(input);
  const program = new IntcodeProgram(instructions);

  const robot = new IntPair(0n, 0n);
  let direction = Direction.Up;

  while (!program.halted) {
    const hash = robot.hash();
    const colorOn = painted.get(hash) ?? 0n;
    program.in(colorOn);
    program.run();

    const paintColor = program.out();
    painted.set(hash, paintColor);

    const turn = program.out() === 0n ? -1 : 1;
    direction = (direction + turn + Direction.__MAX_DIRECTION) % Direction.__MAX_DIRECTION;
    const [dx, dy] = delta.get(direction);
    robot.move(dx, dy);
  }
}

const first = (input: string) => {
  const painted: Map<bigint, bigint> = new Map([[new IntPair(0n, 0n).hash(), 0n]]);
  paintRegistrationId(input, painted);
  return painted.size;
};

const expectedFirstSolution = -1;

const second = (input: string) => {
  const painted: Map<bigint, bigint> = new Map([[new IntPair(0n, 0n).hash(), 1n]]);
  paintRegistrationId(input, painted);

  let x_min = Number.MAX_SAFE_INTEGER, x_max = Number.MIN_SAFE_INTEGER;
  let y_min = x_min, y_max = x_max;

  for (const hash of painted.keys()) {
    const coord = IntPair.fromHash(hash);
    x_min = Math.min(x_min, Number(coord.x));
    x_max = Math.max(x_max, Number(coord.x));
    y_min = Math.min(y_min, Number(coord.y));
    y_max = Math.max(y_max, Number(coord.y));
  }

  for (let y = y_min; y <= y_max; ++y) {
    const row: string[] = [];
    for (let x = x_min; x <= x_max; ++x) {
      row.push((painted.get(new IntPair(x, y).hash()) ?? 0n) === 0n ? '.' : '#');
    }
    console.log(row.join(''));
  }

  return -1;
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
