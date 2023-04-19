import axios, {AxiosError} from "axios";

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

function lefts<L, R>(eithers: Either<L, R>[]): Either<L, R>[] {
  return eithers
    .filter(field => field instanceof Left)
}

// function lefts<L, R>(eithers: Either<L, R>[]): Left<L>[] {
//   return eithers
//     .filter(either => either instanceof Left)
//     .map(lefts => lefts as L)
// }

function rights<L, R>(eithers: Either<L, R>[]): Either<L, R>[] {
  return eithers
    .filter(field => field instanceof Right)
}

function leftValues<L, R>(eithers: Either<L, R>[]): L[] {
  return lefts<L, R>(eithers)
    .map(left => left.value as L);
}

function rightValue<R>(right: Right<R>): R {
  return right.value as R;
}

function rightValues<L, R>(eithers: Either<L, R>[]): R[] {
  return rights<L, R>(eithers)
    .map(right => right.value as R);
}

function eitherValue<L, R>(either: Either<L, R>): L | R {
  return either instanceof Left ?
    either.value as L :
    either.value as R;
}

function eitherValues<L, R>(eithers: Either<L, R>[]): (L | R)[] {
  return eithers.map(eitherValue);
}

function everyLeft<L, R>(eithers: Either<L, R>[]): boolean {
  return eithers.every(either => either instanceof Left);
}

function everyRight<L, R>(eithers: Either<L, R>[]): boolean {
  return eithers.every(either => either instanceof Right);
}

type RawPokemon = {
  name: string;
  url: string;
}

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
    name: string
  };
  weight: number;
  sprites: {
    front_default: string
  };
}

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

function pokemonId(separatorIndex: number): (url: string) => Either<string, number> {
  return (url: string): Either<string, number> => {
    const id = Number.parseInt(url.split("/")[separatorIndex]);

    return Number.isSafeInteger(id) ?
      new Right(id) :
      new Left(`Failure extracting pokemonId [ ${url} ]`);
  }
}

function pokemonName(pokemon: Pokemon): string {
  return pokemon.name;
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

function rawToPokemonSpecs(pokemonSpecs: RawPokemonSpecs): Either<string, PokemonSpecs> {
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
    const {message} = (err as Error);
    return new Left<string>(message);
  }
}

async function pokemons(limit: number = 150): Promise<Either<string[], Pokemon>[]> {
  try {
    const pokemonsResponse = await axios.get<{
      results: RawPokemon[]
    }>(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);

    return pokemonsResponse.data.results.map(
      pokemon => rawToPokemon(pokemon, pokemonId(6))
    );
  } catch (err) {
    const {message, status} = (err as AxiosError);
    const errorMessage = JSON.stringify({message, status});

    return [new Left([errorMessage])];
  }
}

async function pokemonSpecs(pokemonName: string): Promise<Either<string, PokemonSpecs>> {
  try {
    const pokemonSpecsResponse
      = await axios.get<RawPokemonSpecs>(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

    const rawPokemonSpecs: RawPokemonSpecs = pokemonSpecsResponse.data;

    return rawPokemonSpecs ?
      rawToPokemonSpecs(rawPokemonSpecs) :
      new Left(`Unable to get the specs of the ${pokemonName} pokemon.`);
  } catch (err) {
    const {message, code} = (err as AxiosError);
    return new Left(`Pokemon [${pokemonName}], ${message} / code ${code}`);
  }
}

// pokemonSpecs("pikachu")
//   .then(result => console.log((eitherValue(result))))
//   .catch(err => console.log(`error ${err}`));

async function flatAsyncEitherValues<L, R>(promises: Promise<Either<L, R>>[]) {
  const result: (L | R)[] = [];

  for (const promise of promises) {
    const promiseEither = await promise;
    result.push(promiseEither.value);
  }

  return result;
}

async function leftsAsync<L, R>(promises: Promise<Either<L, R>>[]) {
  const result: L[] = [];

  for (const promise of promises) {
    const promiseEither = await promise;
    if (promiseEither instanceof Left) {
      result.push(promiseEither.value);
    }
  }

  return result;
}

async function rightsAsync<L, R>(promises: Promise<Either<L, R>>[]) {
  const result: R[] = [];

  for (const promise of promises) {
    const promiseEither = await promise;
    if (promiseEither instanceof Right) {
      result.push(promiseEither.value);
    }
  }

  return result;
}

// const d1 = Promise.resolve(new Left<string>("My Left"));
// const d2 = Promise.resolve(new Right<number>(999));
// const demos = flatAsyncEitherValues([d1, d2]);
// console.log(`demos`, demos);

// async function specs(): Promise<PokemonSpecs> {
//   return pokemons()
//     .then(rightValues)
//     .then(pokemons => pokemons.map(pokemonName))
//     .then(pokemonNames =>
//       pokemonNames.map(name => pokemonSpecs(name))
//     );
//     // .then(pokemonNames => pokemonNames.map(name }) => pokemonSpecs(name)))
//     // .then(rightValues);
// }
function splitLeftsRights<L, R>(eithers: Either<L, R>[]): { lefts: Left<L>[], rights: Right<R> } {
  return {
    lefts: lefts(eithers),
    rights: rights(eithers)
  }
}

async function main() {
  const _pokemons = await pokemons();

  return pokemons()
    .then(pokemons => {
      const _lefts = lefts(pokemons);
      const _rights = rights(pokemons);

      return {
        lefts: leftValues(_lefts).flat(),
        rights: _rights,
      }
    })
    // .then(rightValues)
    .then(pokemons => {
      return {
        lefts: pokemons.lefts,
        rights: rightValues(pokemons.rights).map(pokemonName),
      }
    })
    .then(async (pokemonNames) => {
      const eithers = await Promise.all(pokemonNames.rights.map(pokemonSpecs));
      const _lefts = lefts(eithers);
      const _rights = rights(eithers);

      return {
        lefts: [...pokemonNames.lefts, ...leftValues(_lefts)],
        rights: _rights
      }
    })
    .then(pokemonSpecs => {
      const _rights = rights(pokemonSpecs.rights);
      return {
        lefts: pokemonSpecs.lefts,
        rights: _rights
      }
    })
    // .then(rightValues)
    .then(pokemonSpecs => {
      return {
        errors: pokemonSpecs.lefts,
        pokemons: rightValues(pokemonSpecs.rights)
      }
    });
}

main()
  .then(res => console.log(res));
