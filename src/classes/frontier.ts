import { IFrontier } from "../models/frontier.model";
import { INode } from "../models/node.model";
import { ActorNode } from "./node";

export abstract class Frontier<T extends INode<any, any>>
  implements IFrontier<T>
{
  frontier: T[] = [];

  addNode(node: T | undefined) {
    if (!node) {
      throw new Error("No node to add!");
    }
    this.frontier.push(node);
  }

  isNodeInFrontier(node: T, comparisonKey: keyof T["state"]): boolean {
    return this.frontier.some(
      (element) => element.state[comparisonKey] === node.state[comparisonKey]
    );
  }

  get isEmpty() {
    return this.frontier.length === 0;
  }

  abstract removeNode(): T | undefined;
}

export class QueueFrontier<T extends INode<any, any>> extends Frontier<T> {
  constructor() {
    super();
  }

  removeNode() {
    if (this.isEmpty) {
      return;
    }
    const [firstNode, ...rest] = this.frontier;
    this.frontier = rest;
    return firstNode;
  }
}
