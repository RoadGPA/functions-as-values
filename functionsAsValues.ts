import axios, { AxiosError } from "axios";
import mockedPokemons from "./pokemons";
import mockedPokemonSpecs from "./pokemonsSpecs";

class Left<T> {
  readonly #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  get value(): T {
    return this.#value;
  }
}

class Right<T> {
  readonly #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  get value(): T {
    return this.#value;
  }
}

type Either<L, R> = Left<L> | Right<R>;

function lefts<L, R>(eithers: Either<L, R>[]): Left<L>[] {
  return eithers
    .filter((either) => either instanceof Left)
    .map((lefts) => lefts as Left<L>);
}

function rights<L, R>(eithers: Either<L, R>[]): Right<R>[] {
  return eithers
    .filter((either) => either instanceof Right)
    .map((either) => either as Right<R>);
}

function leftValue<L>(left: Left<L>): L {
  return left.value as L;
}

function leftValues<L, R>(eithers: Either<L, R>[]): L[] {
  return lefts<L, R>(eithers).map(leftValue);
}

function rightValue<R>(right: Right<R>): R {
  return right.value as R;
}

function rightValues<L, R>(eithers: Either<L, R>[]): R[] {
  return rights<L, R>(eithers).map(rightValue);
}

function everyLeft<L, R>(eithers: Either<L, R>[]): boolean {
  return eithers.every((either) => either instanceof Left);
}

function everyRight<L, R>(eithers: Either<L, R>[]): boolean {
  return eithers.every((either) => either instanceof Right);
}

type RawPokemon = {
  name: string;
  url: string;
};

class Pokemon {
  id: number;
  name: string;
  url: string;

  constructor(id: number, name: string, url: string) {
    this.id = id;
    this.name = name;
    this.url = url;
  }
}

type RawPokemonSpecs = {
  id: number;
  species: {
    name: string;
  };
  weight: number;
  sprites: {
    front_default: string;
  };
};

class PokemonSpecs {
  id: number;
  name: string;
  weight: number;
  frontPicture: string;

  constructor(id: number, name: string, weight: number, frontPicture: string) {
    this.id = id;
    this.name = name;
    this.weight = weight;
    this.frontPicture = frontPicture;
  }
}

function pokemonId(
  separatorIndex: number
): (url: string) => Either<string, number> {
  return (url: string): Either<string, number> => {
    const id = Number.parseInt(url.split("/")[separatorIndex]);

    return Number.isSafeInteger(id)
      ? new Right(id)
      : new Left(`Failure extracting pokemonId [ ${url} ]`);
  };
}

function pokemonName(pokemon: Pokemon): string {
  return pokemon.name;
}

function pokemonNames(pokemons: Pokemon[]): string[] {
  return pokemons.map(pokemonName);
}

function rawToPokemon(
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

function rawToPokemonSpecs(
  pokemonSpecs: RawPokemonSpecs
): Either<string, PokemonSpecs> {
  try {
    return new Right(
      new PokemonSpecs(
        pokemonSpecs.id,
        pokemonSpecs.species.name,
        pokemonSpecs.weight,
        pokemonSpecs.sprites.front_default
      )
    );
  } catch (err) {
    const { message } = err as Error;
    return new Left<string>(message);
  }
}

async function pokemons(
  limit: number = 150
): Promise<Either<string[], Pokemon>[]> {
  try {
    // const pokemonsResponse = await axios.get<{
    //   results: RawPokemon[];
    // }>(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);

    // return pokemonsResponse.data.results.map((pokemon) =>
    //   rawToPokemon(pokemon, pokemonId(6))
    // );

    const mockedRawPokemons = mockedPokemons as RawPokemon[];
    return mockedRawPokemons.map((pokemon) =>
      rawToPokemon(pokemon, pokemonId(6))
    );
  } catch (err) {
    const { message, status } = err as AxiosError;
    const errorMessage = JSON.stringify({ message, status });

    return [new Left([errorMessage])];
  }
}

async function pokemonSpecs(
  pokemonName: string
): Promise<Either<string, PokemonSpecs>> {
  try {
    // const pokemonSpecsResponse = await axios.get<RawPokemonSpecs>(
    //   `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    // );
    //
    // const rawPokemonSpecs: RawPokemonSpecs = pokemonSpecsResponse.data;

    // return rawPokemonSpecs
    //   ? rawToPokemonSpecs(rawPokemonSpecs)
    //   : new Left(`Unable to get the specs of the ${pokemonName} pokemon.`);

    const mockedRawPokemonsSpec = mockedPokemonSpecs.find(
      (poke) => pokemonName === poke.name
    );

    return mockedRawPokemonsSpec
      ? new Right(mockedRawPokemonsSpec)
      : new Left(`Unable to get the specs of the ${pokemonName} pokemon.`);
  } catch (err) {
    const { message, code } = err as AxiosError;
    return new Left(`Pokemon [${pokemonName}], ${message} / code ${code}`);
  }
}

async function pokemonsSpecs(
  pokemonNames: string[]
): Promise<Either<string, PokemonSpecs>[]> {
  return Promise.all(pokemonNames.map(pokemonSpecs));
}

type EitherSplit<L, R> = {
  lefts: Left<L>[];
  rights: Right<R>[];
};

type EitherSplitValues<L, R> = {
  lefts: L[];
  rights: R[];
};

function splitEither<L, R>(eithers: Either<L, R>[]): EitherSplit<L, R> {
  return {
    lefts: lefts(eithers),
    rights: rights(eithers),
  };
}

function splitEitherValues<L, R>(
  eithers: Either<L, R>[]
): EitherSplitValues<L, R> {
  return {
    lefts: leftValues(lefts(eithers)),
    rights: rightValues(rights(eithers)),
  };
}

function trackLefts<L>(): {
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
        pokemons: rights,
      };
    });
}

main().then((res) => console.log(res));
