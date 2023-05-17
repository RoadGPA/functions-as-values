import { RawPokemonSpecs } from "../1_Data/RawPokemonSpecs";
import { Either, Left, Right } from "../../1_FPTools/either";
import { PokemonSpecs } from "../1_Data/PokemonSpecs";

export function rawToPokemonSpecs(
  pokemon: RawPokemonSpecs
): Either<string, PokemonSpecs> {
  try {
    return new Right(
      new PokemonSpecs(
        pokemon.id,
        pokemon.species.name,
        pokemon.weight,
        pokemon.sprites.front_default
      )
    );
  } catch (err) {
    return new Left(
      `Could not parse Pokemon Specs for Pokemon ${pokemon.species.name}`
    );
  }
}
