import { Either, Left, Right } from "../../1_FPTools/either";

export function pokemonId(
  separatorIndex: number
): (url: string) => Either<string, number> {
  return (url: string): Either<string, number> => {
    const id = Number.parseInt(url.split("/")[separatorIndex]);

    return Number.isSafeInteger(id)
      ? new Right(id)
      : new Left(`Failure extracting pokemonId [ ${url} ]`);
  };
}
