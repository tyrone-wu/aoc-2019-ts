import Queue from 'yocto-queue';
import { IntPair } from '../utils';

function isKey(char: string): boolean {
  return 'a' <= char && char <= 'z';
}

function isDoor(char: string): boolean {
  return 'A' <= char && char <= 'Z';
}

const aUnicode = 'a'.charCodeAt(0);

function parseInput(input: string): [string[][], [number, number], number] {
  let x: number, y: number;
  let keys = 0;

  let rowNum = 0;
  const map = input.trimEnd().split('\n').map(line => {
    const row = line.split('');
    for (let i = 0; i < row.length; ++i) {
      if (row[i] === '@') {
        x = i;
        y = rowNum;
      } else if (isKey(row[i])) {
        const key = row[i].charCodeAt(0) - aUnicode;
        keys |= 1 << key;
      }
    }
    ++rowNum;
    return row;
  });
  return [map, [x, y], keys];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function debugKeys(keys: number): void {
  let key = 0;
  const output: string[] = [];
  while (keys > 0) {
    if ((keys & 1) === 1) {
      output.push(String.fromCharCode(key + aUnicode));
    }
    keys >>>= 1;
    ++key;
  }
  console.log(output.join(','));
}

const delta: [number, number][] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

const first = (input: string) => {
  const [map, entrance, allKeys] = parseInput(input);

  const visited: Map<string, number> = new Map();
  const bfs: Queue<[[number, number], number, number]> = new Queue();
  bfs.enqueue([entrance, 0, 0]);

  const hash = (x: number, y: number, keys: number): string => {
    return `${x},${y}-${keys}`;
  };

  while (bfs.size > 0) {
    const [[x, y], keys, steps] = bfs.dequeue();
    const state = hash(x, y, keys);
    if (steps >= (visited.get(state) ?? Number.MAX_SAFE_INTEGER)) {
      continue;
    }
    visited.set(state, steps);

    if (keys === allKeys) {
      return steps;
    }

    for (const [dx, dy] of delta) {
      const nextSpace = map[y + dy][x + dx];

      if (nextSpace === '#') {
        continue;
      }

      if (isKey(nextSpace)) {
        const k = 1 << (nextSpace.charCodeAt(0) - aUnicode);
        bfs.enqueue([[x + dx, y + dy], keys | k, steps + 1]);
      } else if (isDoor(nextSpace)) {
        const d = 1 << (nextSpace.toLowerCase().charCodeAt(0) - aUnicode);
        if ((keys & d) !== 0) {
          bfs.enqueue([[x + dx, y + dy], keys, steps + 1]);
        }
      } else {
        bfs.enqueue([[x + dx, y + dy], keys, steps + 1]);
      }
    }
  }

  return -1;
};

const expectedFirstSolution = 81;

function constructGraph(map: string[][]): Map<string, Map<string, number>> {
  const bfs = (start: [number, number]): Map<string, number> => {
    const edges: Map<string, number> = new Map();
    const visited: Set<bigint> = new Set([IntPair.hashIntPair(start[0], start[1])]);
    const queue: Queue<[[number, number], number]> = new Queue();
    queue.enqueue([start, 0]);
    while (queue.size > 0) {
      const [[x, y], steps] = queue.dequeue();
      for (const [dx, dy] of delta) {
        const hash = IntPair.hashIntPair(x + dx, y + dy);
        if (visited.has(hash)) {
          continue;
        }

        const nextSpace = map[y + dy][x + dx];
        if (nextSpace === '.') {
          visited.add(hash);
          queue.enqueue([[x + dx, y + dy], steps + 1]);
        } else if (nextSpace !== '#' && !edges.has(nextSpace)) {
          edges.set(nextSpace, steps + 1);
        }
      }
    }
    return edges;
  };

  const graph: Map<string, Map<string, number>> = new Map();
  for (let y = 0; y < map.length; ++y) {
    for (let x = 0; x < map[0].length; ++x) {
      if (map[y][x] === '#' || map[y][x] === '.') {
        continue;
      }
      graph.set(map[y][x], bfs([x, y]));
    }
  }
  return graph;
}

class State {
  robots: [string, string, string, string];
  keys: number;

  constructor(robots: [string, string, string, string], keys: number) {
    this.robots = robots;
    this.keys = keys;
  }

  toString(): string {
    const symbols = this.robots.join('|');
    return `${symbols}-${this.keys}`;
  }

  clone(): State {
    return new State([...this.robots], this.keys);
  }
}

const second = (input: string) => {
  const [map, entrance, allKeys] = parseInput(input);
  map[entrance[1]][entrance[0]] = '#';
  for (const [dx, dy] of delta) {
    map[entrance[1] + dy][entrance[0] + dx] = '#';
  }
  const entranceSymbols: [string, string, string, string] = ['@', '$', '%', '&'];
  const entrances: [number, number][] = [[1, -1], [-1, -1], [-1, 1], [1, 1]].map(([dx, dy]) => [entrance[0] + dx, entrance[1] + dy]);
  for (let i = 0; i < entrances.length; ++i) {
    const [x, y] = entrances[i];
    map[y][x] = entranceSymbols[i];
  }

  // const getKeys = (x: number, y: number, visited: Set<bigint>): number => {
  //   let keysFound = isKey(map[y][x]) ? (1 << (map[y][x].charCodeAt(0) - aUnicode)) : 0;
  //   for (const [dx, dy] of delta) {
  //     const hash = IntPair.hashIntPair(x + dx, y + dy);
  //     if (map[y + dy][x + dx] !== '#' && !visited.has(hash)) {
  //       visited.add(hash);
  //       keysFound |= getKeys(x + dx, y + dy, visited);
  //     }
  //   }
  //   return keysFound;
  // };

  // const quadrantKeys: [number, number, number, number] = [0, 0, 0, 0];
  // for (let i = 0; i < entrances.length; ++i) {
  //   const [x, y] = entrances[i];
  //   quadrantKeys[i] = getKeys(x, y, new Set());
  //   // debugKeys(quadrantKeys[i]);
  // }

  const graph = constructGraph(map);
  let minSteps = Number.MAX_SAFE_INTEGER;

  const start = new State(entranceSymbols, 0);
  const visited: Map<string, number> = new Map();
  const bfs: Queue<[State, number]> = new Queue();
  bfs.enqueue([start.clone(), 0]);

  while (bfs.size > 0) {
    const [state, steps] = bfs.dequeue();
    const stateString = state.toString();
    if (steps >= (visited.get(stateString) ?? Number.MAX_SAFE_INTEGER)) {
      continue;
    }
    visited.set(stateString, steps);

    if (state.keys === allKeys) {
      minSteps = Math.min(minSteps, steps);
      return minSteps;
    }

    for (let i = 0; i < 4; ++i) {
      const currentSymbol = state.robots[i];
      for (const [nextSymbol, distance] of graph.get(currentSymbol)) {
        const clone = state.clone();
        clone.robots[i] = nextSymbol;
        if (isKey(nextSymbol)) {
          const k = 1 << (nextSymbol.charCodeAt(0) - aUnicode);
          clone.keys |= k;
          bfs.enqueue([clone, steps + distance]);
        } else if (isDoor(nextSymbol)) {
          const d = 1 << (nextSymbol.toLowerCase().charCodeAt(0) - aUnicode);
          if ((state.keys & d) !== 0) {
            bfs.enqueue([clone, steps + distance]);
          }
        } else {
          bfs.enqueue([clone, steps + distance]);
        }
      }
    }
  }

  return minSteps;
};

const expectedSecondSolution = 72;

export { first, expectedFirstSolution, second, expectedSecondSolution };
