import { Either, lefts, leftValues } from "./either";

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
