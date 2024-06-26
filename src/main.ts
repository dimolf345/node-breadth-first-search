import fs from "fs";
import path from "path";
import csv from "csv-parser";
import readline, { ReadLineOptions } from "readline";

import {
  DataSet,
  DataSize,
  FileName,
  Movie,
  Actor,
  Star,
} from "./models/data.model";
import { ActorNode, BFS } from "./classes";
import { askQuestion } from "./utils/askQuestion";

const terminal = (config?: {
  withCompleter: boolean;
  dataSource: Map<string, Actor>;
}) => {
  const readlineconfig: ReadLineOptions = {
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  };

  if (config?.withCompleter) {
    readlineconfig.completer = (search: string) => {
      const names = [...config.dataSource.values()].map(({ name }) => name);
      const hits = names.filter((name) =>
        name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
      );
      return [hits.length ? hits : names, search];
    };
  }
  return readline.createInterface(readlineconfig);
};

/**
 * Asks the user which dataset to use (small or large dataset).
 * In case of input not allowed, small dataset is loaded.
 * @returns `small` or  `large`
 */
function askForDataSetSize() {
  let result: DataSize = "small";
  const prompt = terminal();

  return new Promise<DataSize>((resolve, _) => {
    prompt.question(
      "What dataset do you want to use?\n0 - Small\n1 - Large\nEnter your choice: ",
      (answer) => {
        switch (answer) {
          case "0":
            console.log("Loading the small dataset");
            break;
          case "1":
            console.log("Loading the large dataset. This could take a while");
            result = "large";
            break;
          default:
            console.log(
              "Your choice is not valid. Default will be small Dataset"
            );
        }
        prompt.close();
        resolve(result);
      }
    );
  });
}

/**
 * Reads the data from csv files and returns a Map or a Set containing
 * the parsed data from csv file
 */
function parseCsv<T extends Object>(
  size: DataSize,
  name: FileName,
  idKey?: keyof T
) {
  const result = idKey ? new Map<string, T>() : new Set<T>();
  const filePath = path.resolve(__dirname, size, `${name}.csv`);

  return new Promise<Map<string, T> | Set<T>>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data: T) => {
        if (idKey) {
          if (!Object.hasOwn(data, idKey)) {
            throw new Error(`${String(idKey)} not found in  ${data}`);
          } else {
            (result as Map<string, T>).set(data[idKey] as string, data);
          }
        } else {
          (result as Set<T>).add(data);
        }
      })
      .on("end", () => resolve(result))
      .on("error", (error) => reject(error));
  });
}

/**
 * Loads all the data necessary for the BFS
 * @param dataSet variable use to decide whether to import to small or large dataset
 * @returns
 */
async function loadData(dataSet: DataSize): Promise<DataSet | undefined> {
  try {
    const actors = (await parseCsv<Actor>(dataSet, "people", "id")) as Map<
      string,
      Actor
    >;
    const movies = (await parseCsv<Movie>(dataSet, "movies", "id")) as Map<
      string,
      Movie
    >;
    const stars = (await parseCsv<Star>(dataSet, "stars")) as Set<Star>;
    return {
      actors,
      movies,
      stars,
    };
  } catch (error) {
    console.error("Error reading CSV file: ", error);
  }
}

/**
 * Asks for which dataSet to choose and which actors to search through
 * @param size
 * @param data
 * @returns
 */
async function askForSearchInfo(
  size: DataSize,
  data: Map<string, Actor>
): Promise<Actor[]> {
  //Composition of query text
  let queryText: string;

  let startOrFinish: "start" | "finish" = "start";
  const query = () =>
    `Write name and surname of the actor you want to ${startOrFinish} with.\n`;

  if (size == "small") {
    const optionsString = [...data.values()].reduce(
      (acc, curr) => (acc += curr.name + "\n"),
      "\nOptions available are: \n"
    );
    queryText = query() + "\n" + optionsString + "\n";
  } else {
    queryText = query();
  }
  //

  let prompt = () => terminal({ withCompleter: true, dataSource: data });
  //First actor question
  const firstQuestion = await askQuestion(
    prompt(),
    queryText,
    (answer: string) => {
      return [...data.values()].find(({ name }) => name === answer)!;
    }
  ).then((result) => result as Actor);

  startOrFinish = "finish";
  queryText = "\n" + query();
  //Second actor question
  const secondQuestion = await askQuestion(
    prompt(),
    queryText,
    (answer: string) => {
      return [...data.values()].find(({ name }) => name === answer)!;
    }
  ).then((result) => result as Actor);

  return Promise.all([firstQuestion, secondQuestion]);
}

function createSolutionString(solution: ActorNode[]) {
  let resultString = "";
  const degrees = solution.length;
  let degressLeft = degrees - 1;
  for (const item of solution) {
    if (item.parent) {
      const degreeString = `\n${degressLeft}: ${item.parent.state.name} and ${item.state.name} starred in ${item.action?.title}`;

      resultString = degreeString.concat(resultString);
    } else {
      resultString = `\n${degrees - 1} degree/s of separation.`.concat(
        resultString
      );
    }
    degressLeft--;
  }
  return resultString;
}

async function main() {
  const dataSetSize = await askForDataSetSize();

  const dataset = await loadData(dataSetSize);

  if (!dataset) {
    throw new Error("Something went wrong when loading the data");
  }

  const { actors, movies, stars } = dataset;

  const [start, goal] = await askForSearchInfo(dataSetSize, actors);

  const youngestActor = Math.max(+start.birth, +goal.birth);

  for (const star of stars) {
    const { movieId } = star;
    const movie = movies.get(movieId);
    const movieYear = Number(movie?.year);
    if (movieYear <= youngestActor) {
      stars.delete(star);
    }
  }

  const bfs = new BFS(start, goal, dataset);

  try {
    const solution = await bfs.startSearch();
    if (solution.length) {
      console.log(createSolutionString(solution));
    } else {
      console.log("\nThere is no link with the two actors!");
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

main();
