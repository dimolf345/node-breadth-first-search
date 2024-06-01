import { IBFS } from "../models/bfs.model";
import { Actor, DataSet, Movie } from "../models/data.model";
import { IFrontier } from "../models/frontier.model";
import { printAndClear } from "../utils/loadingMessage";
import { QueueFrontier } from "./frontier";
import { ActorNode } from "./node";

export class BFS implements IBFS<Actor, ActorNode> {
  start: Actor;
  goal: Actor;
  search: IFrontier<ActorNode>;
  dataSet: DataSet;

  currentNode: ActorNode | undefined;
  exploredItems: Set<string>;

  constructor(start: Actor, goal: Actor, dataSet: DataSet) {
    this.start = start;
    this.goal = goal;
    this.dataSet = dataSet;
    this.search = new QueueFrontier();
    this.exploredItems = new Set<string>();
    this.search.addNode(new ActorNode(this.start));
  }

  checkGoal(node: ActorNode | undefined) {
    if (!node) {
      return false;
    }
    return node.state.id === this.goal.id;
  }

  expandNode(node: ActorNode) {
    const { movies, stars, actors } = this.dataSet;
    const { state } = node;

    //Finds all the movies in which the actor was present
    const currentActorMovieIds = [...stars.values()]
      .filter(({ personId }) => personId === state.id)
      .map(({ movieId }) => movieId);

    for (const movie of currentActorMovieIds) {
      const movieObj = movies.get(movie);
      const actorIdsInTheSameFilm = [...stars.values()]
        .filter(
          ({ movieId, personId }) =>
            movieId === movie &&
            personId !== state.id &&
            personId !== this.start.id &&
            !this.exploredItems.has(personId)
        )
        .map(({ personId }) => personId);

      for (const actorId of actorIdsInTheSameFilm) {
        const actor = actors.get(actorId);

        if (actor) {
          if (Number(movieObj?.year) <= Number(actor.birth)) {
            continue;
          }

          const actorNode = new ActorNode(actor, node, movieObj);
          if (!this.search.isNodeInFrontier(actorNode, "id")) {
            this.search.addNode(actorNode);
          }
        }
      }
    }
  }

  startSearch(): ActorNode[] {
    const result: ActorNode[] = [];
    let count = 0;

    while (!this.checkGoal(this.currentNode)) {
      count++;

      printAndClear(count);

      this.currentNode = this.search.removeNode();

      if (!this.currentNode) {
        return [];
      } else {
        this.expandNode(this.currentNode);
      }

      if (this.exploredItems.has(this.currentNode.state.id)) {
        this.currentNode = this.search.removeNode();
      }

      this.exploredItems.add(this.currentNode!.state.id);
    }

    do {
      result.push(this.currentNode!);
      this.currentNode = this.currentNode?.parent || undefined;
    } while (this.currentNode);

    return result;
  }
}
