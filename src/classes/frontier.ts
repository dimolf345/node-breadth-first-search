import { IFrontier } from "../models/frontier.model";
import { INode } from "../models/node.model";

export abstract class Frontier implements IFrontier {
  frontier: INode<unknown, unknown>[] = [];

  add(node: INode<unknown, unknown>) {
    this.frontier.push(node);
  }

  get isEmpty() {
    return this.frontier.length === 0;
  }

  abstract removeNode(): INode<unknown, unknown> | undefined;
}

export class QueueFrontier extends Frontier {
  constructor() {
    super();
  }

  removeNode() {
    if (this.isEmpty) {
      return;
    }
    return this.frontier.shift();
  }
}
