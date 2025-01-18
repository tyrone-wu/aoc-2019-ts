import { IntcodeProgram, parseIntcodeProgram } from '../intcode';
import { permutation } from '../utils';

const first = (input: string) => {
  const instructions = parseIntcodeProgram(input);

  let maxThrusterSignal = 0;

  const permutations: bigint[][] = [];
  permutation([0n, 1n, 2n, 3n, 4n], [], permutations);
  for (const sequence of permutations) {
    let thrusterSignal = 0n;
    for (const input of sequence) {
      const amp = new IntcodeProgram(new Map(instructions), input);
      amp.in(thrusterSignal);
      amp.run();
      thrusterSignal = amp.out();
    }

    maxThrusterSignal = Math.max(maxThrusterSignal, Number(thrusterSignal));
  }

  return maxThrusterSignal;
};

const expectedFirstSolution = 65210;

const second = (input: string) => {
  const instructions = parseIntcodeProgram(input);

  let maxThrusterSignal = 0;

  const permutations: bigint[][] = [];
  permutation([5n, 6n, 7n, 8n, 9n], [], permutations);
  for (const sequence of permutations) {
    const amps: IntcodeProgram[] = [];
    for (const input of sequence) {
      amps.push(new IntcodeProgram(new Map(instructions), input));
    }

    let thrusterSignal = 0n;
    while (!amps[4].halted) {
      for (const amp of amps) {
        amp.in(thrusterSignal);
        amp.run();
        thrusterSignal = amp.out();
      }
    }
    maxThrusterSignal = Math.max(maxThrusterSignal, Number(thrusterSignal));
  }

  return maxThrusterSignal;
};

const expectedSecondSolution = 18216;

export { first, expectedFirstSolution, second, expectedSecondSolution };
