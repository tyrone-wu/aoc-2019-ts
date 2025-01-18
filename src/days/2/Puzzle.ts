import { IntcodeProgram, parseIntcodeProgram } from '../intcode';

const first = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const program = new IntcodeProgram(instructions);
  program.program.set(1n, 12n);
  program.program.set(2n, 2n);
  program.run();

  return program.program.get(0n);
};

const expectedFirstSolution = 3500;

const second = (input: string) => {
  const instructions = parseIntcodeProgram(input);

  for (let noun = 0n; noun <= 99; ++noun) {
    for (let verb = 0n; verb <= 99; ++verb) {
      const program = new IntcodeProgram(new Map(instructions));
      program.program.set(1n, noun);
      program.program.set(2n, verb);
      program.run();

      if (program.program.get(0n) === 19690720n) {
        return 100n * noun + verb;
      }
    }
  }

  return -1;
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
