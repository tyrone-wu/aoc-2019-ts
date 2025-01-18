import { createInterface } from 'node:readline';
import { IntcodeProgram, parseIntcodeProgram } from '../intcode';

function debug(program: IntcodeProgram): void {
  const output: string[] = [];
  while (program.output.size > 0) {
    output.push(String.fromCharCode(Number(program.out())));
  }
  console.log(output.join(''));
}

function step(program: IntcodeProgram, verbose: boolean, cmd?: string): void {
  if (cmd !== undefined) {
    program.inAscii(cmd, true);
  }
  program.run();

  if (verbose) {
    debug(program);
  }
}

function readInput(): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>(resolve => {
    rl.question('', (input) => {
      rl.close();
      resolve(input);
    });
  });
}

const first = async (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const program = new IntcodeProgram(instructions);

  const commands: string[] = [
    'east', 'take festive hat',
    'east', 'take food ration',
    'east', 'take spool of cat6',
    'west', 'west', 'south', 'east', 'east', 'take fuel cell',
    'west', 'west', 'north', 'west', 'west', 'take hologram',
    'north', 'take space heater',
    'east', 'take space law space brochure',
    'east', 'take tambourine',

    'west', 'west', 'south', 'east', // back to hull breach
    'east', 'south', 'east', 'east', 'east', // security checkpoint
    'drop festive hat', 'drop food ration', 'drop fuel cell', 'drop tambourine',
  ];
  for (const cmd of commands) {
    step(program, true, cmd);
  }
  step(program, true);

  const cmds: string[] = [];
  let inputCmd: string;
  while ((inputCmd = await readInput()) !== 'q') {
    cmds.push(inputCmd);
    step(program, true, inputCmd);
  }
  console.log('Program exited.');
  console.log(`new cmds: '${cmds.join("', '")}'`);

  return -1;
};

const expectedFirstSolution = -1;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const second = (input: string) => {
  return '';
};

const expectedSecondSolution = '';

export { first, expectedFirstSolution, second, expectedSecondSolution };
