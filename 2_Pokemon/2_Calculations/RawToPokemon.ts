import {
  Either,
  everyRight,
  Left,
  leftValues,
  Right,
} from "../../1_FPTools/either";

// Data
import { RawPokemon } from "../1_Data/RawPokemon";
import { Pokemon } from "../1_Data/Pokemon";

export function rawToPokemon(
  pokemon: RawPokemon,
  extractId: (url: string) => Either<string, number>
): Either<string[], Pokemon> {
  const id = extractId(pokemon.url);
  const eithers = [id];

  const isOk = everyRight(eithers);

  if (isOk) {
    return new Right(
      new Pokemon(id.value as number, pokemon.name, pokemon.url)
    );
  } else {
    return new Left(leftValues(eithers));
  }
}
