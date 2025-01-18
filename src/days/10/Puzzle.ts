import { gcd, IntPair } from '../utils';

function parseInput(input: string): [Set<bigint>, bigint, bigint] {
  const asteroids: Set<bigint> = new Set();
  const lines = input.trimEnd().split('\n');
  for (let y = 0n; y < lines.length; ++y) {
    const line = lines[Number(y)].split('');
    for (let x = 0n; x < line.length; ++x) {
      if (line[Number(x)] === '#') {
        asteroids.add(IntPair.hashIntPair(x, y));
      }
    }
  }
  const x_max = BigInt(lines[0].length), y_max = BigInt(lines.length);
  return [asteroids, x_max, y_max];
}

function slope(c1: IntPair, c2: IntPair): [bigint, bigint] {
  const dx = c2.x - c1.x, dy = c2.y - c1.y;
  const div = gcd(dx, dy);
  return [dx / div, dy / div];
}

function sweepAsteroids(stationHash: bigint, asteroids: Set<bigint>, x_max: bigint, y_max: bigint): Set<bigint> {
  const detectedAstroids: Set<bigint> = new Set();
  const station = IntPair.fromHash(stationHash);

  for (const asteroidHash of asteroids) {
    if (stationHash === asteroidHash) {
      continue;
    }

    const asteroid = IntPair.fromHash(asteroidHash);
    const [dx, dy] = slope(station, asteroid);

    const current = station.clone();
    while ((0n <= current.x && current.x < x_max) && (0n <= current.y && current.y < y_max)) {
      current.move(dx, dy);
      const hash = current.hash();
      if (asteroids.has(hash)) {
        detectedAstroids.add(hash);
        break;
      }
    }
  }

  return detectedAstroids;
}

function optimalStationPlacement(asteroids: Set<bigint>, x_max: bigint, y_max: bigint): [number, bigint] {
  let maxDetected = 0;
  let optimalStationHash = 0n;
  for (const stationHash of asteroids) {
    const detectedAstroids = sweepAsteroids(stationHash, asteroids, x_max, y_max);
    if (maxDetected < detectedAstroids.size) {
      maxDetected = detectedAstroids.size;
      optimalStationHash = stationHash;
    }
    maxDetected = Math.max(maxDetected, detectedAstroids.size);
  }
  return [maxDetected, optimalStationHash];
}

const first = (input: string) => {
  const [asteroids, x_max, y_max] = parseInput(input);
  return optimalStationPlacement(asteroids, x_max, y_max)[0];
};

const expectedFirstSolution = 210;

function radians(origin: IntPair, coord: IntPair): number {
  // re-positions to stations origin, and rotates 90 degrees clockwise
  const normalized = new IntPair(origin.y - coord.y, origin.x - coord.x);

  let angle = Math.atan2(Number(normalized.y), Number(normalized.x));
  const circle = 2 * Math.PI;
  if (angle < 0) {
    angle += circle;
  }

  // ccw to cw
  angle = (circle - angle) % circle;

  return angle;
}

const second = (input: string) => {
  const [asteroids, x_max, y_max] = parseInput(input);
  const optimalStationHash = optimalStationPlacement(asteroids, x_max, y_max)[1];
  asteroids.delete(optimalStationHash);
  const station = IntPair.fromHash(optimalStationHash);

  let asteroidsVaporized = 0;
  while (asteroids.size !== 0) {
    const detectedAstroids = sweepAsteroids(optimalStationHash, asteroids, x_max, y_max);

    if (asteroidsVaporized + detectedAstroids.size < 200) {
      asteroidsVaporized += detectedAstroids.size;
      for (const detected of detectedAstroids) {
        asteroids.delete(detected);
      }
    } else {
      const detectedArr = [...detectedAstroids].map(h => IntPair.fromHash(h));
      detectedArr.sort((a, b) => {
        const aAngle = radians(station, a);
        const bAngle = radians(station, b);;

        return aAngle - bAngle;
      });

      const target = detectedArr[200 - asteroidsVaporized - 1];
      return target.x * 100n + target.y;
    }
  }

  return -1;
};

const expectedSecondSolution = 802n;

export { first, expectedFirstSolution, second, expectedSecondSolution };
