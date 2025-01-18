function parseInput(input: string): number[] {
  return input.trimEnd().split('').map(n => parseInt(n, 10));
}

function decodeLayers(pixels: number[], wide: number, tall: number): number[][] {
  const imageLayers: number[][] = [];
  const layer: number[] = [];
  for (const pixel of pixels) {
    layer.push(pixel);

    if (layer.length === wide * tall) {
      imageLayers.push(layer.slice());
      layer.length = 0;
    }
  }
  return imageLayers;
}

const first = (input: string) => {
  const pixels = parseInput(input);
  const wide = 25, tall = 6;

  const imageLayers = decodeLayers(pixels, wide, tall);

  let minZeroPixels = Number.MAX_SAFE_INTEGER;
  let ans = 0;
  for (const layer of imageLayers) {
    const digitsCount: number[] = new Array(10).fill(0);
    for (const pixel of layer) {
      ++digitsCount[pixel];
    }

    if (digitsCount[0] < minZeroPixels) {
      minZeroPixels = digitsCount[0];
      ans = digitsCount[1] * digitsCount[2];
    }
  }
  return ans;
};

const expectedFirstSolution = 0;

const second = (input: string) => {
  const pixels = parseInput(input);
  const wide = 25, tall = 6;

  const imageLayers = decodeLayers(pixels, wide, tall);

  const image: number[] = new Array(wide * tall).fill(-1);
  let filled = 0;
  for (const layer of imageLayers) {
    for (const i in layer) {
      if (layer[i] !== 2 && image[i] === -1) {
        image[i] = layer[i];

        if (++filled === wide * tall) {
          break;
        }
      }
    }
    if (filled === wide * tall) {
      break;
    }
  }

  for (let t = 0; t < tall; ++t) {
    const s = t * wide;
    const row = image.slice(s, s + wide).map(p => p === 0 ? '⬛️' : '⬜️').join('');
    console.log(row);
  }

  return -1;
};

const expectedSecondSolution = -1;

export { first, expectedFirstSolution, second, expectedSecondSolution };
