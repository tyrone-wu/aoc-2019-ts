import { lcm } from '../utils';

class Vector {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  move(delta: Vector): void {
    this.x += delta.x;
    this.y += delta.y;
    this.z += delta.z;
  }

  manDist(origin?: Vector): number {
    if (origin === undefined) {
      origin = new Vector(0, 0, 0);
    }
    return Math.abs(this.x - origin.x) + Math.abs(this.y - origin.y) + Math.abs(this.z - origin.z);
  }

  toString(): string {
    return `${this.x},${this.y},${this.z}`;
  }

  clone(): Vector {
    return new Vector(this.x, this.y, this.z);
  }
}

function vectorFromString(input: string): Vector {
  const compts = input.split(', ').map(comp => {
    const n = comp.slice(comp.indexOf('=') + 1);
    return parseInt(n, 10);
  });
  return new Vector(compts[0], compts[1], compts[2]);
}

class Moon {
  id: number;
  position: Vector;
  velocity: Vector;
  acceleration: Vector;

  constructor(i: number, position: Vector, velocity: Vector, acceleration: Vector) {
    this.id = i;
    this.position = position;
    this.velocity = velocity;
    this.acceleration = acceleration;
  }

  static fromInput(i: number, input: string): Moon {
    return new Moon(i, vectorFromString(input), new Vector(0, 0, 0), new Vector(0, 0, 0));
  }

  updateGravity(other: Moon): void {
    const delta = (a: number, b: number) => {
      const d = b - a;
      return d !== 0 ? d / Math.abs(d) : 0;
    };

    this.acceleration.x += delta(this.position.x, other.position.x);
    this.acceleration.y += delta(this.position.y, other.position.y);
    this.acceleration.z += delta(this.position.z, other.position.z);
  }

  updateVelocity(): void {
    this.velocity.move(this.acceleration);
    this.acceleration.x = 0;
    this.acceleration.y = 0;
    this.acceleration.z = 0;
  }

  updatePosition(): void {
    this.position.move(this.velocity);
  }

  potentialEnergy(): number {
    return this.position.manDist();
  }

  kineticEnergy(): number {
    return this.velocity.manDist();
  }

  state(): [string, string, string] {
    const state = (pos: number, vel: number): string => `${pos},${vel}`;
    return [
      state(this.position.x, this.velocity.x),
      state(this.position.y, this.velocity.y),
      state(this.position.z, this.velocity.z),
    ];
  }
}

function parseInput(input: string): Moon[] {
  let i = 0;
  return input.trimEnd().split('\n').map(line => Moon.fromInput(i++, line));
}

const first = (input: string) => {
  const moons = parseInput(input);

  const steps = 1000;
  for (let s = 0; s < steps; ++s) {
    for (const m1 of moons) {
      for (const m2 of moons) {
        if (m1.id === m2.id) {
          continue;
        }

        m1.updateGravity(m2);
      }
    }

    for (const m of moons) {
      m.updateVelocity();
      m.updatePosition();
    }
  }

  let totalEnergy = 0;
  for (const moon of moons) {
    totalEnergy += moon.potentialEnergy() * moon.kineticEnergy();
  }
  return totalEnergy;
};

const expectedFirstSolution = 14645;

const second = (input: string) => {
  const moons = parseInput(input);

  const moonsState = (moons: Moon[]): [string, string, string] => {
    const xState: string[] = [];
    const yState: string[] = [];
    const zState: string[] = [];

    for (const moon of moons) {
      const [xS, yS, zS] = moon.state();
      xState.push(xS);
      yState.push(yS);
      zState.push(zS);
    }

    return [xState.join('|'), yState.join('|'), zState.join('|')];
  };
  const initialState = moonsState(moons);
  const cycleAt: [bigint, bigint, bigint] = [undefined, undefined, undefined];

  let steps = 0n;
  while (!cycleAt.every(c => c !== undefined)) {
    for (const m1 of moons) {
      for (const m2 of moons) {
        if (m1.id === m2.id) {
          continue;
        }

        m1.updateGravity(m2);
      }
    }

    for (const m of moons) {
      m.updateVelocity();
      m.updatePosition();
    }
    ++steps;

    const state = moonsState(moons);
    for (let i = 0; i < 3; ++i) {
      if (cycleAt[i] !== undefined) {
        continue;
      }

      if (state[i] === initialState[i]) {
        cycleAt[i] = BigInt(steps);
      }
    }
  }

  const cycle = lcm(lcm(cycleAt[0], cycleAt[1]), cycleAt[2]);
  return cycle;
};

const expectedSecondSolution = 4686774924n;

export { first, expectedFirstSolution, second, expectedSecondSolution };
