import { IntcodeProgram, parseIntcodeProgram } from '../intcode';

const first = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const program = new IntcodeProgram(instructions, 1n);
  program.run();

  const output = [...program.output];
  const ans = output.pop();
  if (!output.every(out => out === 0n)) {
    throw new Error('output not all zero');
  }
  return ans ? ans : -1;
};

const expectedFirstSolution = -1;

const second = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const program = new IntcodeProgram(instructions, 5n);
  program.run();

  const output = [...program.output];
  const ans = output.pop();
  if (!output.every(out => out === 0n)) {
    throw new Error('output not all zero');
  }
  return ans;
};

const expectedSecondSolution = 999;

export { first, expectedFirstSolution, second, expectedSecondSolution };
