export type DataSize = "small" | "large";

export type FileName = "people" | "movies" | "stars";

export type Person = {
  id: string;
  name: string;
  birth: string;
};

export type Movie = {
  id: string;
  title: string;
  year: string;
};

export type Star = {
  personId: string;
  movieId: string;
};

export type DataSet = {
  people: Map<string, Person>;
  movies: Map<string, Movie>;
  stars: Map<string, Star>;
};
