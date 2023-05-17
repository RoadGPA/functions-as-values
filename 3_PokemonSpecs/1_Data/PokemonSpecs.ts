export class PokemonSpecs {
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
