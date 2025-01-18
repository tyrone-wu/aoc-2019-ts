function permutation<T>(pool: T[], items: T[], permutations: T[][]): void {
  if (pool.length === 0) {
    permutations.push(items);
    return;
  }

  for (let i = 0; i < pool.length; ++i) {
    permutation([...pool.slice(0, i), ...pool.slice(i + 1)], [...items, pool[i]], permutations);
  }
}

class IntPair {
  x: bigint;
  y: bigint;

  private static readonly offset = (1n << 10n);
  public static readonly shift = 20n;

  constructor(x: bigint | number, y: bigint | number) {
    this.x = BigInt(x);
    this.y = BigInt(y);
  }

  static hashIntPair(n1: bigint | number, n2: bigint | number): bigint {
    n1 = BigInt(n1) + IntPair.offset;
    n2 = BigInt(n2) + IntPair.offset;
    return (n1 << IntPair.shift) | n2;
  }

  hash(): bigint {
    return IntPair.hashIntPair(this.x, this.y);
  }

  static fromHash(hash: bigint): IntPair {
    const decodedX = (hash >> IntPair.shift) - IntPair.offset;
    const decodedY = (hash & ((1n << IntPair.shift) - 1n)) - IntPair.offset;
    return new IntPair(decodedX, decodedY);
  }

  clone(): IntPair {
    return new IntPair(this.x, this.y);
  }

  move(dx: bigint | number, dy: bigint | number): void {
    this.x += BigInt(dx);
    this.y += BigInt(dy);
  }

  debug(): void {
    console.log(`${this.x},${this.y}`);
  }
}

function gcd(n1: bigint, n2: bigint): bigint {
  n1 = n1 < 0 ? -n1 : n1;
  n2 = n2 < 0 ? -n2 : n2;

  if (n1 === 0n) {
    return n2;
  }

  while (n2 !== 0n) {
    const tmp = n2;
    n2 = n1 % n2;
    n1 = tmp;
  }
  return n1;
}

function lcm(n1: bigint, n2: bigint): bigint {
  return (n1 * n2) / gcd(n1, n2);
}

function ceilDiv(n1: bigint, n2: bigint): bigint {
  return (n1 + n2 - 1n) / n2;
}

export { permutation, IntPair, gcd, lcm, ceilDiv };
