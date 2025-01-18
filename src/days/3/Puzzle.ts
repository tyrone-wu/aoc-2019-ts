class Vector {
  readonly direction: [number, number];
  readonly magnitude: number;

  constructor(input: string) {
    if (input[0] === 'U') {
      this.direction = [0, 1];
    } else if (input[0] === 'R') {
      this.direction = [1, 0];
    } else if (input[0] === 'D') {
      this.direction = [0, -1];
    } else if (input[0] === 'L') {
      this.direction = [-1, 0];
    } else {
      throw new Error('invalid direction');
    }

    this.magnitude = parseInt(input.slice(1), 10);
  }
}

class Coord {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  hash(): bigint {
    return (BigInt(this.x) << 32n) | BigInt(this.y);
  }

  static fromHash(hash: bigint): Coord {
    return new Coord(Number(hash >> 32n), Number(hash & ((1n << 32n) - 1n)));
  }

  // equals(other: Coord): boolean {
  //   return this.x === other.x && this.y === other.y;
  // }

  copy(): Coord {
    return new Coord(this.x, this.y);
  }
}

function parseInput(input: string): [Vector[], Vector[]] {
  const lines = input.split('\n');
  const wireOne = lines[0].split(',').map(vec => new Vector(vec));
  const wireTwo = lines[1].split(',').map(vec => new Vector(vec));
  return [wireOne, wireTwo];
}

function tracePath(wire: Vector[]): Map<bigint, number> {
  const path: Map<bigint, number> = new Map();
  const coord = new Coord(0, 0);
  let steps = 0;
  for (const { direction, magnitude } of wire) {
    for (let i = 0; i < magnitude; ++i) {
      coord.x += direction[0];
      coord.y += direction[1];
      path.set(coord.hash(), ++steps);
    }
  }
  return path;
}

const first = (input: string) => {
  const [wireOne, wireTwo] = parseInput(input);
  const onePath = tracePath(wireOne);
  const twoPath = tracePath(wireTwo);

  let closestIntersection = Number.MAX_SAFE_INTEGER;
  for (const one of onePath.keys()) {
    if (twoPath.has(one)) {
      const coord = Coord.fromHash(one);
      const manDist = Math.abs(coord.x) + Math.abs(coord.y);
      closestIntersection = Math.min(closestIntersection, manDist);
    }
  }
  return closestIntersection;
};

const expectedFirstSolution = 159;

const second = (input: string) => {
  const [wireOne, wireTwo] = parseInput(input);
  const onePath = tracePath(wireOne);
  const twoPath = tracePath(wireTwo);

  let minInterSteps = Number.MAX_SAFE_INTEGER;
  for (const [k, v] of onePath.entries()) {
    if (twoPath.has(k)) {
      const steps = v + twoPath.get(k);
      minInterSteps = Math.min(minInterSteps, steps);
    }
  }
  return minInterSteps;
};

const expectedSecondSolution = 410;

export { first, expectedFirstSolution, second, expectedSecondSolution };
