export type DataSize = "small" | "large";

export type FileName = "people" | "movies" | "stars";

export type Actor = {
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
  actors: Map<string, Actor>;
  movies: Map<string, Movie>;
  stars: Set<Star>;
};
