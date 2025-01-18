import { ceilDiv } from '../utils';

const enum Op {
  Mod, Add, Sub, Mul,
}

function mod(op: Op, a: bigint, b: bigint, m: bigint,): bigint {
  if (op === Op.Mod) {
    return ((a % m) + m) % m;
  }

  a = mod(Op.Mod, a, undefined, m);
  if (b !== undefined) {
    b = mod(Op.Mod, b, undefined, m);
  }
  switch (op) {
    case Op.Add: {
      return mod(Op.Mod, a + b, undefined, m);
    }
    case Op.Sub: {
      return mod(Op.Mod, a - b, undefined, m);
    }
    case Op.Mul: {
      return mod(Op.Mod, a * b, undefined, m);
    }
  }
}

function computeAB(ab1: [bigint, bigint], ab2: [bigint, bigint], m: bigint): [bigint, bigint] {
  const [a1, b1] = ab1;
  const [a2, b2] = ab2;

  const a = mod(Op.Mul, a1, a2, m);
  const b = mod(Op.Add, mod(Op.Mul, b1, a2, m), b2, m);
  return [a, b];
}

function computePos(ab: [bigint, bigint], x: bigint, m: bigint): bigint {
  const [a, b] = ab;
  return mod(Op.Add, mod(Op.Mul, a, x, m), b, m);
}

const enum ShuffleType {
  NewStack,
  Cut,
  Increment,
}

class ShuffleMethod {
  type: ShuffleType;
  value: number;
  a: bigint;
  b: bigint;

  constructor(input: string, deckSize: bigint) {
    if (input === 'deal into new stack') {
      this.type = ShuffleType.NewStack;
      this.value = 0;

      this.a = -1n;
      this.b = -1n;
    } else if (input.startsWith('cut')) {
      this.type = ShuffleType.Cut;
      this.value = parseInt(input.slice(input.indexOf(' ') + 1), 10);

      this.a = 1n;
      this.b = BigInt(this.value);
    } else {
      this.type = ShuffleType.Increment;
      this.value = parseInt(input.slice(input.lastIndexOf(' ') + 1), 10);

      const biValue = BigInt(this.value);
      this.a = 0n;
      let s = 0n;
      while (mod(Op.Sub, 1n, s, biValue) !== 0n) {
        this.a += ceilDiv(deckSize - s, biValue);
        s = (biValue - (deckSize % biValue) + s) % biValue;
      }
      this.a += (1n - s) / biValue;
      this.b = 0n;
    }
  }

  shuffle(deck: Uint16Array, buffer?: Uint16Array): void {
    if (this.type === ShuffleType.NewStack) {
      deck.reverse();
    } else if (this.type === ShuffleType.Cut) {
      const cards = this.value < 0 ? this.value + deck.length : this.value;

      for (let i = 0; i < cards; ++i) {
        buffer[i] = deck[i];
      }
      const rest = deck.length - cards;
      for (let i = 0; i < deck.length; ++i) {
        deck[i] = i < rest ? deck[i + cards] : buffer[i - rest];
      }
    } else {
      for (let i = 0; i < deck.length; ++i) {
        buffer[i] = deck[i];
      }
      for (let i = 0, j = 0; i < deck.length; ++i, j = (j + this.value) % deck.length) {
        deck[j] = buffer[i];
      }
    }
  }

  getAB(): [bigint, bigint] {
    return [this.a, this.b];
  }

  computeMethodAB(x: [bigint, bigint], deckSize: bigint): [bigint, bigint] {
    return computeAB(this.getAB(), x, deckSize);
  }

  shufflePosition(pos: bigint, deckSize: bigint): bigint {
    // if (this.type === ShuffleType.NewStack) {
    //   return deckSize - pos - 1n;
    // } else if (this.type === ShuffleType.Cut) {
    //   return modOp(Op.Sub, deckSize, pos, BigInt(this.value));
    // } else {
    //   return modOp(Op.Mul, deckSize, pos, BigInt(this.value));
    // }

    return computePos(this.getAB(), pos, deckSize);
    // return mod(Op.Mod, mod(Op.Add, mod(Op.Mul, this.a, pos, deckSize), this.b, deckSize), undefined, deckSize);
  }
}

function parseInput(input: string, asdf: bigint): ShuffleMethod[] {
  return input.trimEnd().split('\n').map(line => new ShuffleMethod(line, asdf));
}

const first = (input: string) => {
  const size = 10007;
  const deck = new Uint16Array(size);
  for (let i = 0; i < deck.length; ++i) {
    deck[i] = i;
  }
  const buffer = new Uint16Array(size);

  const shuffles = parseInput(input, BigInt(size));
  for (const method of shuffles) {
    method.shuffle(deck, buffer);
  }
  // console.log(deck.join(' '));

  return deck.indexOf(2019);
};

const expectedFirstSolution = -1;

// https://codeforces.com/blog/entry/72527
// https://codeforces.com/blog/entry/72593
const second = (input: string) => {
  const size = 119315717514047n;
  // const size = 10n;
  let cycles = 101741582076661n;

  const shuffles = parseInput(input, size);
  // shuffles.reverse();

  let ab: [bigint, bigint] = [1n, 0n];
  for (const method of shuffles) {
    ab = method.computeMethodAB(ab, size);
  }

  // const deck = new Uint16Array(Number(size));
  // for (let i = 0n; i < size; ++i) {
  //   const pos = Number(computePos(ab, i, size));
  //   deck[pos] = Number(i);
  // }
  // console.log(deck.join(' '));

  let pos = 2020n;
  let toShuffle = 1n;
  while (cycles > 0n) {
    if (cycles % (2n * toShuffle) !== 0n) {
      cycles -= toShuffle;
      pos = computePos(ab, pos, size);
    }
    ab = computeAB(ab, ab, size);
    toShuffle *= 2n;
  }

  return pos;
};

//  62718694048287 low
//  78108437612017 low
//  33996494047632 low

// 112905223072132 nope
//  74603010542488 nope

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
