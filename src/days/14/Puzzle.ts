class Reactant {
  quantity: number;
  chemical: string;

  constructor(quantity: number, chemical: string) {
    this.quantity = quantity;
    this.chemical = chemical;
  }

  static fromString(input: string): Reactant {
    const split = input.split(' ');
    const quantity = parseInt(split[0], 10);
    const chemical = split[1];
    return new Reactant(quantity, chemical);
  }

  toString(): string {
    return `${this.quantity} ${this.chemical}`;
  }
}

class Reaction {
  reactants: Reactant[];
  product: Reactant;

  constructor(input: string) {
    const split = input.split(' => ');
    this.reactants = split[0].split(', ').map(r => Reactant.fromString(r));
    this.product = Reactant.fromString(split[1]);
  }
}

function parseInput(input: string): Reaction[] {
  return input.trimEnd().split('\n').map(line => new Reaction(line));
}

function reactionsMap(reactions: Reaction[]): Map<string, Reaction> {
  const map: Map<string, Reaction> = new Map();
  for (const reaction of reactions) {
    const productChem = reaction.product.chemical;
    map.set(productChem, reaction);
  }
  return map;
}

function dfs(reactions: Map<string, Reaction>, chemical: string, order: string[], visited: Set<string>) {
  if (chemical === 'ORE') {
    return;
  }

  for (const reactant of reactions.get(chemical).reactants) {
    if (!visited.has(reactant.chemical)) {
      visited.add(reactant.chemical);
      dfs(reactions, reactant.chemical, order, visited);
    }
  }
  order.push(chemical);
}

function reactantsForFuel(reactions: Map<string, Reaction>, reactionOrder: string[], fuelQuantity: number): [Map<string, number>, Map<string, number>] {
  const needs: Map<string, number> = new Map([['FUEL', fuelQuantity]]);
  const produced: Map<string, number> = new Map();
  for (const chemical of reactionOrder) {
    const { reactants, product } = reactions.get(chemical);

    const needed = needs.get(chemical);
    const factor = Math.ceil(needed / product.quantity);
    produced.set(chemical, factor * product.quantity + (produced.get(chemical) ?? 0));

    for (const { chemical: rChem, quantity: rQuant } of reactants) {
      needs.set(rChem, factor * rQuant + (needs.get(rChem) ?? 0));
    }
  }

  return [needs, produced];
}

const first = (input: string) => {
  const reactionsArr = parseInput(input);
  const reactions = reactionsMap(reactionsArr);

  const reactionOrder: string[] = [];
  dfs(reactions, 'FUEL', reactionOrder, new Set(['FUEL']));
  reactionOrder.reverse();
  const reactantsNeeded = reactantsForFuel(reactions, reactionOrder, 1)[0];
  return reactantsNeeded.get('ORE');
};

const expectedFirstSolution = 2210736;

function fuelToOre(reactions: Map<string, Reaction>, reactionOrder: string[], fuelQuantity: number): number {
  return reactantsForFuel(reactions, reactionOrder, fuelQuantity)[0].get('ORE');
}

const second = (input: string) => {
  const reactionsArr = parseInput(input);
  const reactions = reactionsMap(reactionsArr);

  const fuelOrder: string[] = [];
  dfs(reactions, 'FUEL', fuelOrder, new Set(['FUEL']));
  fuelOrder.reverse();
  const used = reactantsForFuel(reactions, fuelOrder, 1)[0];
  // console.log(`ore: ${used.get('ORE')}`);

  const totalOre = 1000000000000;
  let low = Math.floor(totalOre / used.get('ORE'));
  let high = low * 2;

  // console.log(low);
  // console.log(low + Math.floor(low / 2));

  while (!(fuelToOre(reactions, fuelOrder, low) <= totalOre && fuelToOre(reactions, fuelOrder, low + 1) > totalOre)) {
    const mid = Math.floor((low + high) / 2);
    const oreMid = fuelToOre(reactions, fuelOrder, mid);
    if (oreMid <= totalOre) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return low;
};

const expectedSecondSolution = 460664;

export { first, expectedFirstSolution, second, expectedSecondSolution };
