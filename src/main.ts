import fs from "fs";
import path from "path";
import csv from "csv-parser";
import readline, { ReadLineOptions } from "readline";

import {
  DataSet,
  DataSize,
  FileName,
  Movie,
  Person,
  Star,
} from "./models/data.model";

const terminal = (config?: {
  withCompleter: boolean;
  dataSource: Map<string, Person>;
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
            console.log("Loading the large dataset");
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
 * Reads the data from csv files and returns a Map containing the mapped
 * csv file
 */
function parseCsv<T extends Object>(
  size: DataSize,
  name: FileName,
  idKey: keyof T
) {
  const result = new Map<string, T>();
  const filePath = path.resolve(__dirname, size, `${name}.csv`);

  return new Promise<Map<string, T>>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data: T) => {
        if (!Object.hasOwn(data, idKey)) {
          throw new Error(`${String(idKey)} not found in  ${data}`);
        } else {
          result.set(data[idKey] as string, data);
        }
      })
      .on("end", () => resolve(result))
      .on("error", (error) => reject(error));
  });
}

async function loadData(dataSet: DataSize): Promise<DataSet | undefined> {
  try {
    const people = await parseCsv<Person>(dataSet, "people", "name");
    const movies = await parseCsv<Movie>(dataSet, "movies", "id");
    const stars = await parseCsv<Star>(dataSet, "stars", "personId");
    return {
      people,
      movies,
      stars,
    };
  } catch (error) {
    console.error("Error reading CSV file: ", error);
  }
}

function askForSearchInfo(size: DataSize, data: Map<string, Person>) {
  let start: Person | undefined;
  let goal: Person | undefined;
  let queryText: string;

  let prompt = terminal({ withCompleter: true, dataSource: data });

  let startOrFinish: "start" | "finish" = "start";
  const query = () =>
    `Write name and surname of the actor you want to ${startOrFinish} with.\n`;

  if (size == "small") {
    const optionsString = [...data.values()].reduce(
      (acc, curr) => (acc += curr.name + "\n"),
      "\nOptions available are: \n"
    );
    queryText = query() + "\n" + optionsString;
  }

  return new Promise<{ start: Person; goal: Person }>((resolve, _) => {
    prompt.question(queryText, (answer) => {
      start = data.get(answer);
      startOrFinish = "finish";
      prompt.close();

      queryText = "\n" + query();
      prompt = terminal({ withCompleter: true, dataSource: data });
      prompt.question(queryText, (answer) => {
        goal = data.get(answer)!;
        if (start && goal) {
          prompt.close();
          resolve({ start, goal });
        }
      });
    });
  });
}

async function main() {
  const dataSetSize = await askForDataSetSize();

  const dataset = await loadData(dataSetSize);

  if (!dataset) {
    throw new Error("Something went wrong when loading the data");
  }

  const { people, movies, stars } = dataset;
  const { start, goal } = await askForSearchInfo(dataSetSize, people);
  return;
}

main();
