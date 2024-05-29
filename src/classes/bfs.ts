import { IBFS } from "../models/bfs.model";
import { Actor, DataSet, Movie } from "../models/data.model";
import { IFrontier } from "../models/frontier.model";
import { QueueFrontier } from "./frontier";
import { ActorNode } from "./node";

export class BFS implements IBFS<Actor, ActorNode> {
  start: Actor;
  goal: Actor;
  search: IFrontier;
  dataSet: DataSet;

  currentNode: ActorNode | undefined;
  exploredItems: Set<number>;

  constructor(start: Actor, goal: Actor, dataSet: DataSet) {
    this.start = start;
    this.goal = goal;
    this.dataSet = dataSet;
    this.search = new QueueFrontier();
    this.exploredItems = new Set<number>();
  }

  checkGoal(node: ActorNode) {
    return node.state.id === this.goal.id;
  }

  expandNode(node: ActorNode) {
    const { movies, stars, actors } = this.dataSet;
    const { state } = node;
    const currentActorMovieIds = [...stars.values()]
      .filter(({ personId }) => personId === state.id)
      .map(({ movieId }) => movieId);

    for (const movie of currentActorMovieIds) {
      const movieObj = movies.get(movie);

      const actorIdsInTheSameFilm = [...stars.values()]
        .filter(({ movieId }) => movieId === movie)
        .map(({ personId }) => personId);

      for (const actorId of actorIdsInTheSameFilm) {
        const actor = actors.get(actorId);
        if (actor) {
          this.search.add(new ActorNode(actor, node, movieObj));
        }
      }
    }
  }

  startSearch(): ActorNode[] {
    return [];
  }
}
