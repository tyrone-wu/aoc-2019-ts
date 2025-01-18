class Grid {
  bugs: number;

  constructor() {
    this.bugs = 0;
  }

  static fromInput(input: string): Grid {
    const grid = new Grid();
    let n = 0;
    for (const c of input) {
      if (c === '\n') {
        continue;
      }
      if (c === '#') {
        grid.bugs |= (1 << n);
      }
      n += 1;
    }
    return grid;
  }

  bugsAdjacent(pos: number): number {
    const adjacent = [pos + 5];
    if ((pos + 1) % 5 !== 0) {
      adjacent.push(pos + 1);
    }
    if ((pos + 4) % 5 !== 4) {
      adjacent.push(pos - 1);
    }
    if (pos >= 5) {
      adjacent.push(pos - 5);
    }

    let bugs = 0;
    for (const i of adjacent) {
      if (this.bugAt(i) === 1) {
        bugs += 1;
      }
    }
    return bugs;
  }

  biodiversity(): number {
    let rating = 0;
    for (let i = 0; i < 25; ++i) {
      const n = 1 << i;
      if ((this.bugs & n) !== 0) {
        rating += n;
      }
    }
    return rating;
  }

  step(): void {
    let next = this.bugs;
    for (let i = 0; i < 25; ++i) {
      const bugsAdj = this.bugsAdjacent(i);
      const n = 1 << i;
      if ((this.bugs & n) !== 0) {
        next ^= bugsAdj === 1 ? 0 : n;
      } else {
        next |= bugsAdj === 1 || bugsAdj === 2 ? n : 0;
      }
    }
    this.bugs = next;
  }

  debug(): void {
    const output: string[] = [];
    for (let i = 0; i < 25; ++i) {
      if ((i % 5) === 0 && output.length !== 0) {
        output.push('\n');
      }
      const n = 1 << i;
      output.push((this.bugs & n) !== 0 ? '#' : '.');
    }
    console.log(output.join(''));
  }

  clone(): Grid {
    const g = new Grid();
    g.bugs = this.bugs;
    return g;
  }

  bugsTop(): number {
    let bugs = 0;
    for (let i = 0; i < 5; ++i) {
      bugs += this.bugAt(i);
    }
    return bugs;
  }

  bugsBot(): number {
    let bugs = 0;
    for (let i = 20; i < 25; ++i) {
      bugs += this.bugAt(i);
    }
    return bugs;
  }

  bugsLeft(): number {
    let bugs = 0;
    for (let i = 0; i < 25; i += 5) {
      bugs += this.bugAt(i);
    }
    return bugs;
  }

  bugsRight(): number {
    let bugs = 0;
    for (let i = 4; i < 25; i += 5) {
      bugs += this.bugAt(i);
    }
    return bugs;
  }

  bugAt(pos: number): number {
    return Number((this.bugs & (1 << pos)) !== 0);
  }
}

const first = (input: string) => {
  const grid = Grid.fromInput(input);
  const seen: Set<number> = new Set();

  while (!seen.has(grid.bugs)) {
    seen.add(grid.bugs);
    grid.step();
    // grid.debug();
  }
  return grid.biodiversity();
};

const expectedFirstSolution = 2129920;

class GridP2 {
  grids: Grid[];

  constructor(grid: Grid) {
    this.grids = [new Grid(), new Grid(), grid, new Grid(), new Grid()];
  }

  static bugsAdjacent(pos: number, outer: Grid, current: Grid, inner: Grid): number {
    let bugs = current.bugsAdjacent(pos);
    if (pos === 6 || pos === 8 || pos === 16 || pos === 18) {
      // no need to account for outer and inner grids
    }

    if (pos === 7) {
      bugs += inner.bugsTop();
    } else if (pos === 17) {
      bugs += inner.bugsBot();
    } else if (pos === 11) {
      bugs += inner.bugsLeft();
    } else if (pos === 13) {
      bugs += inner.bugsRight();
    }

    if (0 <= pos && pos <= 4) {
      bugs += outer.bugAt(7);
    } else if (20 <= pos && pos <= 24) {
      bugs += outer.bugAt(17);
    }
    if (pos === 0 || pos === 5 || pos === 10 || pos === 15 || pos === 20) {
      bugs += outer.bugAt(11);
    } else if (pos === 4 || pos === 9 || pos === 14 || pos === 19 || pos === 24) {
      bugs += outer.bugAt(13);
    }

    return bugs;
  }

  step(): void {
    const next = this.grids.map(g => g.clone());
    for (let i = 1; i < this.grids.length - 1; ++i) {
      const outer = this.grids[i - 1];
      const current = this.grids[i];
      const inner = this.grids[i + 1];

      for (let j = 0; j < 25; ++j) {
        if (j === 12) {
          continue;
        }

        const bugsAdj = GridP2.bugsAdjacent(j, outer, current, inner);
        const n = 1 << j;
        if ((current.bugs & n) !== 0) {
          next[i].bugs ^= bugsAdj === 1 ? 0 : n;
        } else {
          next[i].bugs |= bugsAdj === 1 || bugsAdj === 2 ? n : 0;
        }
      }
    }

    this.grids.length = 0;
    this.grids.push(new Grid());
    for (const grid of next) {
      this.grids.push(grid);
    }
    this.grids.push(new Grid());
  }

  bugs(): number {
    let bugs = 0;
    for (const grid of this.grids) {
      let gridBugs = grid.bugs;
      while (gridBugs > 0) {
        gridBugs &= gridBugs - 1;
        bugs += 1;
      }
    }
    return bugs;
  }

  debug(): void {
    for (const grid of this.grids) {
      grid.debug();
      console.log('===');
    }
  }
}

const second = (input: string) => {
  const grids = new GridP2(Grid.fromInput(input));

  const minutes = 200;
  for (let min = 0; min < minutes; ++min) {
    grids.step();
  }
  // grids.debug();
  return grids.bugs();
};

const expectedSecondSolution = 99;

export { first, expectedFirstSolution, second, expectedSecondSolution };
