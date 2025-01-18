import Queue from 'yocto-queue';

function parseIntcodeProgram(input: string): Map<bigint, bigint> {
  const program: Map<bigint, bigint> = new Map();
  let i = 0n;
  for (const n of input.trimEnd().split(',')) {
    program.set(i++, BigInt(n));
  }
  return program;
}

const enum ParameterMode {
  Position = 0,
  Immediate = 1,
  Relative = 2,
}

class IntcodeProgram {
  ip: bigint;
  program: Map<bigint, bigint>;
  relativeBase: bigint;
  halted: boolean;

  input: Queue<bigint>;
  output: Queue<bigint>;

  constructor(program: Map<bigint, bigint>, initialInput?: bigint | number) {
    this.ip = 0n;
    this.program = program;
    this.relativeBase = 0n;
    this.halted = false;

    this.input = new Queue();
    if (initialInput !== undefined) {
      this.in(BigInt(initialInput));
    }
    this.output = new Queue();
  }

  public in(input: bigint | number): void {
    this.input.enqueue(BigInt(input));
  }

  public inAscii(input: string, newline: boolean): void {
    for (const c of input) {
      this.in(c.charCodeAt(0));
    }
    if (newline) {
      this.in(10);
    }
  }

  public out(): bigint {
    return this.output.dequeue();
  }

  private memAt(ptr: bigint): bigint {
    if (ptr < 0) {
      throw new Error('accessing memory with negative ptr');
    }

    return this.program.get(ptr) ?? 0n;
  }

  private getWithMode(mode: ParameterMode, offset: bigint, read: boolean): bigint {
    const mem = this.memAt(this.ip + offset);
    if (read) {
      switch (mode) {
        case ParameterMode.Position: return this.memAt(mem);
        case ParameterMode.Immediate: return mem;
        case ParameterMode.Relative: return this.memAt(mem + this.relativeBase);
      }
    } else {
      switch (mode) {
        case ParameterMode.Position: return mem;
        case ParameterMode.Immediate: throw new Error('cannot write at immediate');
        case ParameterMode.Relative: return mem + this.relativeBase;
      }
    }
  };

  private getParameterValues(modes: number, numParams: number, read: boolean): bigint[] {
    const paramValues: bigint[] = [];
    for (let offset = 1n; offset <= numParams - 1; ++offset) {
      const mode = (modes % 10) as ParameterMode;
      modes = Math.floor(modes / 10);

      const value = this.getWithMode(mode, offset, true);
      paramValues.push(value);
    }
    const value = this.getWithMode((modes % 10) as ParameterMode, BigInt(numParams), read);
    paramValues.push(value);

    return paramValues;
  }

  public run(): void {
    let pause = false;
    while (!this.halted && !pause) {
      const modes = Math.floor(Number(this.program.get(this.ip)) / 100);
      const opcode = Number(this.program.get(this.ip)) % 100;

      switch (opcode) {
        case 1:
        case 2:
        case 7:
        case 8: {
          const [a, b, w] = this.getParameterValues(modes, 3, false);

          let write: bigint;
          if (opcode === 1) {
            write = a + b;
          } else if (opcode === 2) {
            write = a * b;
          } else if (opcode === 7) {
            write = a < b ? 1n : 0n;
          } else {
            write = a === b ? 1n : 0n;
          }
          this.program.set(w, write);
          this.ip += 4n;
          break;
        }
        case 3: {
          const [w] = this.getParameterValues(modes, 1, false);

          if (this.input.size > 0) {
            this.program.set(w, this.input.dequeue());
            this.ip += 2n;
          } else {
            pause = true;
          }
          break;
        }
        case 4:
        case 9: {
          const [a] = this.getParameterValues(modes, 1, true);

          if (opcode === 4) {
            this.output.enqueue(a);
          } else {
            this.relativeBase += a;
          }
          this.ip += 2n;
          break;
        }
        case 5:
        case 6: {
          const [a, b] = this.getParameterValues(modes, 2, true);

          if ((opcode === 5 && a !== 0n) || (opcode === 6 && a === 0n)) {
            this.ip = b;
          } else {
            this.ip += 3n;
          }
          break;
        }
        case 99: {
          this.halted = true;
          break;
        }
        default:
          throw new Error(`invalid opcode - ip: ${this.ip}, op: ${opcode}`);
      }
    }
  }

  public debugOutput(): void {
    console.log([...this.output]);
  }

  public clone(): IntcodeProgram {
    const clone = new IntcodeProgram(new Map(this.program));
    clone.ip = this.ip;
    clone.relativeBase = this.relativeBase;
    clone.halted = this.halted;
    for (const input of this.input) {
      clone.input.enqueue(input);
    }
    for (const output of this.output) {
      clone.output.enqueue(output);
    }
    return clone;
  }
}

export { parseIntcodeProgram, IntcodeProgram };
