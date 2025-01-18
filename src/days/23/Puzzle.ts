import { IntcodeProgram, parseIntcodeProgram } from '../intcode';

type Packet = [number, number, number];

class Nic {
  program: IntcodeProgram;
  idle: number;

  constructor(netAddr: number, program: IntcodeProgram) {
    this.program = program.clone();
    this.program.in(netAddr);
    this.program.run();
    this.idle = 0;
  }

  receivePacket(packet: Packet): void {
    const [addr, x, y] = packet;
    void addr;
    this.program.in(x);
    this.program.in(y);
  }

  sendPackets(): Packet[] {
    if (this.isQueueEmpty()) {
      this.idle += 1;
      this.program.in(-1);
    } else {
      this.idle = 0;
    }
    this.program.run();

    const packets: Packet[] = [];
    while (this.program.output.size > 0) {
      const packet: Packet = [Number(this.program.out()), Number(this.program.out()), Number(this.program.out())];
      packets.push(packet);
    }
    return packets;
  }

  isQueueEmpty(): boolean {
    return this.program.input.size === 0;
  }
}

const first = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const program = new IntcodeProgram(instructions);

  const nics: Nic[] = [];
  for (let i = 0; i < 50; ++i) {
    nics.push(new Nic(i, program));
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    for (const nic of nics) {
      const packets = nic.sendPackets();
      for (const packet of packets) {
        const addr = packet[0];
        if (addr === 255) {
          return packet[2];
        }
        nics[addr].receivePacket(packet);
      }
    }
  }

  return -1;
};

const expectedFirstSolution = -1;

const second = (input: string) => {
  const instructions = parseIntcodeProgram(input);
  const program = new IntcodeProgram(instructions);

  const nics: Nic[] = [];
  for (let i = 0; i < 50; ++i) {
    nics.push(new Nic(i, program));
  }
  let nat: Packet;
  let prev: Packet;

  const isIdle = (): boolean => {
    for (const nic of nics) {
      if (nic.idle < 3) {
        return false;
      }
    }
    return true;
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (isIdle()) {
      if (prev !== undefined && prev[2] === nat[2]) {
        return prev[2];
      }

      prev = nat;
      nics[0].receivePacket(nat);
    }

    for (const nic of nics) {
      const packets = nic.sendPackets();
      for (const packet of packets) {
        const addr = packet[0];
        if (addr === 255) {
          nat = packet;
        } else {
          nics[addr].receivePacket(packet);
        }
      }
    }
  }

  return -1;
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
