const first = (input: string) => {
  const lines = input.split('\n').slice(0, -1);
  const masses = lines.map((line) => {
    return Math.floor(parseInt(line, 10) / 3) - 2;
  });
  return masses.reduce((acc, mass) => acc + mass, 0);
};

const expectedFirstSolution = -1;

function calcFuel(mass: number): number {
  if (mass == 0) {
    return 0;
  }
  const fuel = Math.max(Math.floor(mass / 3) - 2, 0);
  return fuel + calcFuel(fuel);
}

const second = (input: string) => {
  const lines = input.split('\n').slice(0, -1);
  const masses = lines.map((line) => {
    return calcFuel(parseInt(line, 10));
  });
  return masses.reduce((acc, mass) => acc + mass, 0);
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
