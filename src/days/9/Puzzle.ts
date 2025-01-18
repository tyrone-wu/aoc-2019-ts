import { IntcodeProgram, parseIntcodeProgram } from '../intcode';

const first = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const programTest = new IntcodeProgram(instructions, 1n);
  programTest.run();
  // programTest.debugOutput();

  return programTest.out();
};

const expectedFirstSolution = 1125899906842624n;

const second = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const programTest = new IntcodeProgram(instructions, 2n);
  programTest.run();

  return programTest.out();
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
