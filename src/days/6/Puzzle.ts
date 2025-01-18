function parseInput(input: string): Map<string, string[]> {
  const lines = input.trimEnd().split('\n');
  const orbits: Map<string, string[]> = new Map();
  for (const line of lines) {
    const orbit = line.split(')');
    if (!orbits.has(orbit[0])) {
      orbits.set(orbit[0], []);
    }
    if (!orbits.has(orbit[1])) {
      orbits.set(orbit[1], []);
    }

    orbits.get(orbit[0]).push(orbit[1]);
  }
  return orbits;
}

function dfs(orbits: Map<string, string[]>, object: string, count: number, orbitParents: Map<string, string[]>): number {
  if (!orbitParents.has(object)) {
    orbitParents.set(object, []);
  }
  const parents = [...orbitParents.get(object), object];

  let total = 0;
  for (const outer of orbits.get(object)) {
    orbitParents.set(outer, parents.slice());
    total += dfs(orbits, outer, count + 1, orbitParents);
  }
  return total + count;
}

const first = (input: string) => {
  const orbits = parseInput(input);
  return dfs(orbits, 'COM', 0, new Map());
};

const expectedFirstSolution = 42;

const second = (input: string) => {
  const orbits = parseInput(input);

  const orbitParents: Map<string, string[]> = new Map();
  dfs(orbits, 'COM', 0, orbitParents);

  let maxParentOrbit = 0;
  const sanParents = orbitParents.get('SAN');
  for (const parent of orbitParents.get('YOU')) {
    if (sanParents.includes(parent)) {
      maxParentOrbit = Math.max(maxParentOrbit, orbitParents.get(parent).length);
    }
  }

  return orbitParents.get('YOU').length + orbitParents.get('SAN').length - maxParentOrbit * 2 - 2;
};

const expectedSecondSolution = 4;

export { first, expectedFirstSolution, second, expectedSecondSolution };
