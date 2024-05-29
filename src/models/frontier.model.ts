import { INode } from "./node.model";

export interface IFrontier {
  frontier: INode<unknown, unknown>[];
  isEmpty: boolean;

  add: (node: INode<unknown, unknown>) => void;

  removeNode: () => INode<unknown, unknown> | undefined;
}
