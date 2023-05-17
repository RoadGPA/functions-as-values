import axios, { AxiosError } from "axios";

import { Either, Left } from "../../1_FPTools/either";

// Data
import { PokemonSpecs } from "../1_Data/PokemonSpecs";
import { RawPokemonSpecs } from "../1_Data/RawPokemonSpecs";
// Calculations
import { rawToPokemonSpecs } from "../2_Calculations/RawToPokemonSpecs";

export async function pokemonSpecs(
  pokemonName: string
): Promise<Either<string, PokemonSpecs>> {
  try {
    const pokemonSpecsResponse = await axios.get<RawPokemonSpecs>(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );

    const rawPokemonSpecs: RawPokemonSpecs = pokemonSpecsResponse.data;
    return rawPokemonSpecs
      ? rawToPokemonSpecs(rawPokemonSpecs)
      : new Left(`Unable to get the specs of the ${pokemonName} pokemon.`);

    // const mockedRawPokemonsSpec = mockedPokemonSpecs.find(
    //   (poke) => pokemonName === poke.name
    // );
    //
    // return mockedRawPokemonsSpec
    //   ? new Right(mockedRawPokemonsSpec)
    //   : new Left(`Unable to get the specs of the ${pokemonName} pokemon.`);
  } catch (err) {
    const { message, code } = err as AxiosError;
    return new Left(`Pokemon [${pokemonName}], ${message} / code ${code}`);
  }
}

export async function pokemonsSpecs(
  pokemonNames: string[]
): Promise<Either<string, PokemonSpecs>[]> {
  return Promise.all(pokemonNames.map(pokemonSpecs));
}
