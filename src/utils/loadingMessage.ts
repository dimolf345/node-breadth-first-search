export function printAndClear(count: number) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`Explored ${count} nodes...`);
}
