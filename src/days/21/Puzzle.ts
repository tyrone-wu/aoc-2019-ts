import { IntcodeProgram, parseIntcodeProgram } from '../intcode';

function output(program: IntcodeProgram, verbose: boolean): number {
  const render: string[] = [];
  let hullDamage: number;
  while (program.output.size > 0) {
    const output = Number(program.out());
    if (output === 10) {
      if (verbose) {
        console.log(render.join(''));
      }
      render.length = 0;
    } else if (output <= 255) {
      render.push(String.fromCharCode(output));
    } else {
      hullDamage = output;
    }
  }
  return hullDamage;
}

const first = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const program = new IntcodeProgram(instructions);

  const sprintscript = [
    'NOT C J',
    'OR A T',
    'AND D J',
    'NOT C T',
    'NOT A T',
    'OR T J',
    'WALK',
  ];

  for (const insn of sprintscript) {
    for (const c of insn) {
      program.in(c.charCodeAt(0));
    }
    program.in(10);
  }
  program.run();
  return output(program, false);
};

const expectedFirstSolution = -1;

const second = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const program = new IntcodeProgram(instructions);

  const sprintscript = [
    'NOT C J',
    'OR A T',
    'AND D J',
    'NOT C T',
    'AND H J',
    'NOT B T',
    'AND D T',
    'OR T J',
    'NOT C T',
    'NOT A T',
    'OR T J',
    'RUN',
  ];

  for (const insn of sprintscript) {
    for (const c of insn) {
      program.in(c.charCodeAt(0));
    }
    program.in(10);
  }
  program.run();
  return output(program, false);
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
