import { DataSet } from "./data.model";
import { IFrontier } from "./frontier.model";
import { INode } from "./node.model";

export interface IBFS<T, N extends INode<unknown, unknown>> {
  start: T;
  goal: T;
  search: IFrontier<N>;
  dataSet: DataSet;

  currentNode: N | undefined;
  exploredItems: Set<any>;

  checkGoal(node: N): boolean;

  startSearch(): N[];

  expandNode(node: N): void;
}
