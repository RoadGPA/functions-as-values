import axios, { AxiosError } from "axios";

import { Either, Left } from "../../1_FPTools/either";

// Data
import { Pokemon } from "../1_Data/Pokemon";
import { RawPokemon } from "../1_Data/RawPokemon";

// Calculations
import { rawToPokemon } from "../2_Calculations/RawToPokemon";
import { pokemonId } from "../2_Calculations/PokemonId";

export async function pokemons(
  limit: number = 150
): Promise<Either<string[], Pokemon>[]> {
  try {
    const pokemonsResponse = await axios.get<{
      results: RawPokemon[];
    }>(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);

    return pokemonsResponse.data.results.map((pokemon) =>
      rawToPokemon(pokemon, pokemonId(6))
    );

    // const mockedRawPokemons = mockedPokemons as RawPokemon[];
    // return mockedRawPokemons.map((pokemon) =>
    //   rawToPokemon(pokemon, pokemonId(6))
    // );
  } catch (err) {
    const { message, status } = err as AxiosError;
    const errorMessage = JSON.stringify({ message, status });

    return [new Left([errorMessage])];
  }
}
