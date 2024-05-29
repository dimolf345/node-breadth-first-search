import { Actor, Movie } from "../models/data.model";
import { INode } from "../models/node.model";

export class ActorNode implements INode<Actor, Movie> {
  state!: Actor;
  parent: ActorNode | null;
  action: Movie | undefined;

  constructor(actor: Actor, parent?: ActorNode, action?: Movie) {
    this.state = actor;
    this.parent = parent || null;
    this.action = action;
  }
}
