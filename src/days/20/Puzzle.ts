import Queue from 'yocto-queue';
import { IntPair } from '../utils';

// const wall = '#'.charCodeAt(0);
// const open = '.'.charCodeAt(0);
// const empty = ' '.charCodeAt(0);
// const A = 'A'.charCodeAt(0);

const delta: [number, number][] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

function parseInput(input: string): [string[][], Map<string, [number, number][]>] {
  const map = input.slice(0, -1).split('\n').map(line => line.split(''));
  const portals: Map<string, [number, number][]> = new Map();

  const isAZ = (char: string): boolean => 'A' <= char && char <= 'Z';

  const parsePortal = (x: number, y: number): string => {
    let portal: string = '';
    if (isAZ(map[y - 1][x])) {
      portal = `${map[y - 1][x]}${map[y][x]}`;
    } else if (isAZ(map[y][x - 1])) {
      portal = `${map[y][x - 1]}${map[y][x]}`;
    } else if (isAZ(map[y + 1][x])) {
      portal = `${map[y][x]}${map[y + 1][x]}`;
    } else {
      portal = `${map[y][x]}${map[y][x + 1]}`;
    }
    return portal;
  };

  for (let y = 1; y < map.length - 1; ++y) {
    for (let x = 1; x < map[0].length - 1; ++x) {
      if (isAZ(map[y][x])) {
        for (let i = 0; i < delta.length; ++i) {
          const [dx, dy] = delta[i];
          if (map[y + dy][x + dx] === '.') {
            const portal = parsePortal(x, y);
            if (!portals.has(portal)) {
              portals.set(portal, []);
            }
            portals.get(portal).push([x + dx, y + dy]);
            map[y][x] = portal;
            break;
          }
        }
      }
    }
  }

  return [map, portals];
}

const first = (input: string) => {
  const [map, portals] = parseInput(input);
  const start = portals.get('AA')[0];
  const end = portals.get('ZZ')[0];

  const visited: Set<bigint> = new Set([IntPair.hashIntPair(start[0], start[1])]);
  const bfs: Queue<[[number, number], number]> = new Queue();
  bfs.enqueue([start, 0]);
  while (bfs.size > 0) {
    const [[x, y], steps] = bfs.dequeue();
    if (x === end[0] && y === end[1]) {
      return steps;
    }

    for (const [dx, dy] of delta) {
      const nextSpace = map[y + dy][x + dx];
      if (nextSpace === '#') {
        continue;
      }

      const hashNext = IntPair.hashIntPair(x + dx, y + dy);
      if (nextSpace === '.' && !visited.has(hashNext)) {
        visited.add(hashNext);
        bfs.enqueue([[x + dx, y + dy], steps + 1]);
      } else if (portals.has(nextSpace)) {
        for (const pos of portals.get(nextSpace)) {
          const hashPos = IntPair.hashIntPair(pos[0], pos[1]);
          if (!visited.has(hashPos)) {
            visited.add(hashPos);
            bfs.enqueue([pos, steps + 1]);
          }
        }
      }
    }
  }

  return -1;
};

const expectedFirstSolution = 58;

const second = (input: string) => {
  const [map, portals] = parseInput(input);
  const start = portals.get('AA')[0];
  const end = portals.get('ZZ')[0];

  const isOuterPortal = (x: number, y: number): boolean => (x === 1) || (x === map[0].length - 2) || (y === 1) || (y === map.length - 2);
  const hash = (x: number, y: number, level: number): bigint => IntPair.hashIntPair(x, y) | (BigInt(level) << (2n * IntPair.shift));

  const visited: Set<bigint> = new Set([hash(start[0], start[1], 0)]);
  const bfs: Queue<[[number, number], number, number]> = new Queue();
  bfs.enqueue([start, 0, 0]);
  while (bfs.size > 0) {
    const [[x, y], steps, level] = bfs.dequeue();
    if (x === end[0] && y === end[1] && level === 0) {
      return steps;
    }

    for (const [dx, dy] of delta) {
      const nextSpace = map[y + dy][x + dx];
      if (nextSpace === '#') {
        continue;
      }

      const hashNext = hash(x + dx, y + dy, level);
      if (nextSpace === '.' && !visited.has(hashNext)) {
        visited.add(hashNext);
        bfs.enqueue([[x + dx, y + dy], steps + 1, level]);
      } else if (portals.has(nextSpace)) {
        const isOuter = isOuterPortal(x + dx, y + dy);
        if ((level === 0 && isOuter) || (level > 0 && (nextSpace === 'AA' || nextSpace === 'ZZ'))) {
          continue;
        }

        for (const pos of portals.get(nextSpace)) {
          if (x === pos[0] && y === pos[1]) {
            continue;
          }

          const nextLevel = isOuter ? level - 1 : level + 1;
          const hashPos = hash(pos[0], pos[1], nextLevel);
          if (!visited.has(hashPos)) {
            visited.add(hashPos);
            bfs.enqueue([pos, steps + 1, nextLevel]);
          }
        }
      }
    }
  }

  return -1;
};

const expectedSecondSolution = 396;

export { first, expectedFirstSolution, second, expectedSecondSolution };
