function parseInput(input: string): [number, number] {
  const numArray = input.trimEnd().split('-').map(n => parseInt(n, 10));
  return [numArray[0], numArray[1]];
}

function isValidPassword(password: number, p2: boolean): boolean {
  const digits = password.toString().split('').map(Number);

  let hasDoubleAdjacent = false;
  let digitCount = 0;
  let isMonoIncr = true;

  let prev = -1;
  for (const digit of digits) {
    if (prev !== digit) {
      if ((!p2 && digitCount >= 2) || (p2 && digitCount === 2)) {
        hasDoubleAdjacent = true;
      }
      digitCount = 1;
    } else {
      ++digitCount;
    }

    if (prev > digit) {
      isMonoIncr = false;
      break;
    }

    prev = digit;
  }
  if ((!p2 && digitCount >= 2) || (p2 && digitCount === 2)) {
    hasDoubleAdjacent = true;
  }

  return hasDoubleAdjacent && isMonoIncr;
}

function solve(input: string, p2: boolean): number {
  const [low, high] = parseInput(input);
  let validPasswords = 0;
  for (let password = low; password <= high; ++password) {
    if (isValidPassword(password, p2)) {
      ++validPasswords;
    }
  }
  return validPasswords;
}

const first = (input: string) => {
  return solve(input, false);
};

const expectedFirstSolution = -1;

const second = (input: string) => {
  return solve(input, true);
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
