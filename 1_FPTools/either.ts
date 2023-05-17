export class Left<T> {
  readonly #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  get value(): T {
    return this.#value;
  }
}

export class Right<T> {
  readonly #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  get value(): T {
    return this.#value;
  }
}

export type Either<L, R> = Left<L> | Right<R>;

export function lefts<L, R>(eithers: Either<L, R>[]): Left<L>[] {
  return eithers
    .filter((either) => either instanceof Left)
    .map((lefts) => lefts as Left<L>);
}

export function rights<L, R>(eithers: Either<L, R>[]): Right<R>[] {
  return eithers
    .filter((either) => either instanceof Right)
    .map((either) => either as Right<R>);
}

export function leftValue<L>(left: Left<L>): L {
  return left.value as L;
}

export function leftValues<L, R>(eithers: Either<L, R>[]): L[] {
  return lefts<L, R>(eithers).map(leftValue);
}

export function rightValue<R>(right: Right<R>): R {
  return right.value as R;
}

export function rightValues<L, R>(eithers: Either<L, R>[]): R[] {
  return rights<L, R>(eithers).map(rightValue);
}

export function everyLeft<L, R>(eithers: Either<L, R>[]): boolean {
  return eithers.every((either) => either instanceof Left);
}

export function everyRight<L, R>(eithers: Either<L, R>[]): boolean {
  return eithers.every((either) => either instanceof Right);
}

export type EitherSplit<L, R> = {
  lefts: Left<L>[];
  rights: Right<R>[];
};

export type EitherSplitValues<L, R> = {
  lefts: L[];
  rights: R[];
};

export function splitEither<L, R>(eithers: Either<L, R>[]): EitherSplit<L, R> {
  return {
    lefts: lefts(eithers),
    rights: rights(eithers),
  };
}

export function splitEitherValues<L, R>(
  eithers: Either<L, R>[]
): EitherSplitValues<L, R> {
  return {
    lefts: leftValues(lefts(eithers)),
    rights: rightValues(rights(eithers)),
  };
}

export function trackLefts<L>(): {
  keep: <R>(eithers: Either<L | L[], R>[]) => Either<L | L[], R>[];
  tracks: () => L[];
} {
  let track: L[] = [];

  return {
    keep: <R>(eithers: Either<L | L[], R>[]): Either<L | L[], R>[] => {
      const _lefts = lefts(eithers);
      const _leftValues = Array.isArray(_lefts)
        ? (leftValues(_lefts) as L[])
        : (leftValues([_lefts]) as L[]);

      const flatLefts = _leftValues.flat() as L[];
      flatLefts.forEach((left) => track.push(left));

      return eithers;
    },
    tracks: (): L[] => [...track],
  };
}
