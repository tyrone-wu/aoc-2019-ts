function parseInput(input: string): Int8Array {
  const trimmed = input.trimEnd().split('');
  const digits = new Int8Array(trimmed.length);
  for (const i in trimmed) {
    digits[i] = parseInt(trimmed[i], 10);
  }
  return digits;
}

// function decodeSignal(signal: Int8Array, offset: number): void {
//   const nextBuffer = new Int8Array(signal.length);
//   const pattern = new Int8Array([0, 1, 0, -1]);

//   for (let phase = 0; phase < 100; ++phase) {
//     let secondHalfSum = 0;
//     for (let i = Math.floor(signal.length / 2); i < signal.length; ++i) {
//       secondHalfSum += signal[i];
//     }

//     for (let pos = 1; pos <= signal.length; ++pos) {
//       let sum = 0;
//       if (pos < Math.floor(signal.length / 2)) {
//         // for (let i = pos; i <= signal.length;) {
//         //   const sign = pattern[Math.floor(i / pos) % pattern.length];
//         //   if (sign !== 0) {
//         //     sum += sign * signal[i - 1];
//         //     ++i;
//         //   } else {
//         //     i += pos;
//         //   }
//         // }
//       } else {
//         sum = secondHalfSum;
//         secondHalfSum -= signal[pos - 1];
//       }
//       nextBuffer[pos - 1] = Math.abs(sum) % 10;
//     }

//     for (let i = 0; i < signal.length; ++i) {
//       signal[i] = nextBuffer[i];
//     }
//     // console.log(phase);
//   }
// }

const first = (input: string) => {
  const signal = parseInput(input);
  const nextBuffer = new Int8Array(signal.length);
  const pattern = new Int8Array([0, 1, 0, -1]);

  for (let phase = 0; phase < 100; ++phase) {
    for (let pos = 1; pos <= signal.length; ++pos) {
      let sum = 0;
      for (let i = pos; i <= signal.length;) {
        const sign = pattern[Math.floor(i / pos) % pattern.length];
        if (sign !== 0) {
          sum += sign * signal[i - 1];
          ++i;
        } else {
          i += pos;
        }
      }
      nextBuffer[pos - 1] = Math.abs(sum) % 10;
    }

    for (let i = 0; i < signal.length; ++i) {
      signal[i] = nextBuffer[i];
    }
  }
  return signal.slice(0, 8).join('');
};

const expectedFirstSolution = '23845678';

const second = (input: string) => {
  const signal = parseInput(input);

  let offset = 0;
  for (let i = 0; i < 7; ++i) {
    offset = offset * 10 + signal[i];
  }

  const repeats = 10000;
  const realSignal = new Int8Array(signal.length * repeats);
  for (let i = 0; i < realSignal.length; ++i) {
    realSignal[i] = signal[i % signal.length];
  }

  for (let phase = 0; phase < 100; ++phase) {
    const secondHalf = Math.floor(realSignal.length / 2);
    let sum = 0;
    for (let i = realSignal.length - 1; i > secondHalf; --i) {
      sum += realSignal[i];
      realSignal[i] = sum % 10;
    }
  }

  const msg = new Int8Array(8);
  for (let i = 0; i < 8; ++i) {
    msg[i] = realSignal[i + offset];
  }
  return msg.join('');
};

const expectedSecondSolution = '53553731';

export { first, expectedFirstSolution, second, expectedSecondSolution };
