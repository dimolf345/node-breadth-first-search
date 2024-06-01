import { INode } from "./node.model";

export interface IFrontier<Node extends INode<any, any>> {
  frontier: Node[];
  isEmpty: boolean;

  isNodeInFrontier(node: Node, comparisonKey: keyof Node["state"]): boolean;

  addNode(node: Node): void;

  removeNode(): Node | undefined;
}
