import { rightValues, splitEitherValues } from "./1_FPTools/either";
import { trackLefts } from "./1_FPTools/trackLefts";

// Calculations
import { pokemonNames } from "./2_Pokemon/2_Calculations/PokemonNames";
// Actions
import { pokemons } from "./2_Pokemon/3_Actions/Pokemons";
import { pokemonsSpecs } from "./3_PokemonSpecs/3_Actions/PokemonSpecs";

async function main() {
  const errorTracker = trackLefts<string[] | string>();

  return await pokemons()
    .then(errorTracker.keep)
    .then(rightValues)
    .then(pokemonNames)
    .then(pokemonsSpecs)
    .then(errorTracker.keep)
    .then(splitEitherValues)
    .then(({ rights }) => {
      return {
        errors: errorTracker.tracks(),
        pokemons: rights.map((pokemon) => ({ ...pokemon })),
      };
    });
}

main().then((res) => console.log(res));
