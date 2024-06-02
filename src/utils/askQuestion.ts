import readline from "readline";
import { start } from "repl";

export function askQuestion(
  terminal: readline.Interface,
  question: string,
  validation: (answer: string) => any
) {
  return new Promise((resolve, reject) => {
    terminal.question(question, (answer) => {
      if (validation(answer)) {
        console.log(`${answer} found in the DB.\n`);
        terminal.close();
        resolve(validation(answer));
      } else {
        console.log(`${answer} not found in the DB. Try again.\n`);
        askQuestion(terminal, question, validation);
      }
    });
  });
}
