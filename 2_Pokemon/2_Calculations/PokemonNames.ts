// Data
import { Pokemon } from "../1_Data/Pokemon";

export function pokemonName(pokemon: Pokemon): string {
  return pokemon.name;
}

export function pokemonNames(pokemons: Pokemon[]): string[] {
  return pokemons.map(pokemonName);
}
