import { IntcodeProgram, parseIntcodeProgram } from '../intcode';
import { IntPair } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function debug(scan: boolean[][]): void {
  for (let y = 0; y < scan.length; ++y) {
    const row: string[] = [];
    for (let x = 0; x < scan[0].length; ++x) {
      row.push(scan[y][x] ? '#' : '.');
    }
    console.log(row.join(''));
  }
}

const first = (input: string) => {
  const instructions = parseIntcodeProgram(input);

  const scan: boolean[][] = [];
  for (let y = 0; y < 50; ++y) {
    const row: boolean[] = [];
    for (let x = 0; x < 50; ++x) {
      const program = new IntcodeProgram(new Map(instructions));
      program.in(x);
      program.in(y);
      program.run();
      row.push(program.out() === 1n);
    }
    scan.push([...row]);
  }
  // debug(scan);

  let pulledTotal = 0;
  for (const row of scan.values()) {
    for (const pulled of row) {
      if (pulled) {
        ++pulledTotal;
      }
    }
  }
  return pulledTotal;
};

const expectedFirstSolution = -1;

const second = (input: string) => {
  const instructions = parseIntcodeProgram(input);

  const isPulled = (x: bigint, y: bigint): boolean => {
    const program = new IntcodeProgram(new Map(instructions));
    program.in(x);
    program.in(y);
    program.run();
    return program.out() === 1n;
  };

  const botLeft = new IntPair(15, 8);
  const topRight = new IntPair(15, 8);
  while (botLeft.y - topRight.y < 99 || topRight.x - botLeft.x < 99) {
    if (botLeft.y - topRight.y < 99) {
      while (!isPulled(botLeft.x, botLeft.y + 1n)) {
        botLeft.x += 1n;
      }
      botLeft.y += 1n;
    }
    if (topRight.x - botLeft.x < 99) {
      topRight.y += 1n;
      while (isPulled(topRight.x + 1n, topRight.y)) {
        topRight.x += 1n;
      }
    }
  }

  // for (let y = 0; y <= 8; ++y) {
  //   const row: boolean[] = [];
  //   for (let x = 0; x <= 15; ++x) {
  //     const program = new IntcodeProgram(new Map(instructions));
  //     program.in(x);
  //     program.in(y);
  //     program.run();
  //     row.push(program.out() === 1n);
  //   }
  //   scan.push([...row]);
  // }
  // debug(scan);

  return botLeft.x * 10000n + topRight.y;
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
