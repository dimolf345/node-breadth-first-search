import { Actor, Movie } from "./data.model";

export interface INode<State, Action> {
  state: State;
  parent: INode<State, Action> | null;
  action: Action | undefined;
}

export type ActorNode = INode<Actor, Movie>;
