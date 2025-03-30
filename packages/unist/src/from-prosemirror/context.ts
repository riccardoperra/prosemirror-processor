/*
 * Copyright 2025 Riccardo Perra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type * as Unist from "unist";
import type { ProseMirrorMark, ProseMirrorNode } from "../types.js";
import type { Mark } from "prosemirror-model";

export type ProseMirrorNodeToUnistHandlers<TNode extends Unist.Node> = {
  [Type: string]: ProseMirrorNodeToUnistHandler<TNode>;
};

export type ProseMirrorNodeToUnistHandler<
  TNode extends Unist.Node = Unist.Node,
  TMark extends Unist.Node = Unist.Node,
> = (
  node: ProseMirrorNode,
  parent: ProseMirrorNode | undefined,
  context: ProseMirrorToUnistParseContext<TNode, TMark>,
) => TNode | TNode[] | null;

export type ProseMirrorMarkToUnistHandlers<TNode extends Unist.Node> = {
  [Type: string]: ProseMirrorMarkToUnistHandler<TNode>;
};

export type ProseMirrorMarkToUnistHandler<
  TNode extends Unist.Node = Unist.Node,
  TMark extends Unist.Node = Unist.Node,
> = (
  mark: Mark,
  node: ProseMirrorNode,
  children: TNode[],
  context: ProseMirrorToUnistParseContext<TNode, TMark>,
) => TNode | TNode[] | null;

interface PmMarkedNode {
  node: ProseMirrorNode;
  marks: readonly ProseMirrorMark[];
}

export interface FromProseMirrorCreateContextOptions<
  TNode extends Unist.Node,
  TMark extends Unist.Node,
> {
  nodeName: (pmNode: ProseMirrorNode) => string;
  markName: (mark: ProseMirrorMark) => string;
  textHandler: ProseMirrorNodeToUnistHandler;
  nodeHandlers: ProseMirrorNodeToUnistHandlers<TNode>;
  markHandlers: ProseMirrorMarkToUnistHandlers<TMark>;
}

export class ProseMirrorToUnistParseContext<
  TNode extends Unist.Node,
  TMark extends Unist.Node,
> {
  readonly nodeName: (node: ProseMirrorNode) => string;
  readonly markName: (mark: ProseMirrorMark) => string;
  readonly textHandler: ProseMirrorNodeToUnistHandler;
  readonly nodeHandlers: ProseMirrorNodeToUnistHandlers<TNode>;
  readonly markHandlers: ProseMirrorMarkToUnistHandlers<TMark>;

  constructor({
    nodeName,
    markName,
    textHandler,
    nodeHandlers,
    markHandlers,
  }: FromProseMirrorCreateContextOptions<TNode, TMark>) {
    this.nodeName = nodeName;
    this.markName = markName;
    this.textHandler = textHandler;
    this.nodeHandlers = nodeHandlers;
    this.markHandlers = markHandlers;
  }

  handleAll(pmNode: ProseMirrorNode): TNode[] {
    return this.hydrateMarks(
      pmNode.children.map((child) => ({ node: child, marks: child.marks })),
      pmNode,
    );
  }

  handle(
    pmNode: ProseMirrorNode,
    parent?: ProseMirrorNode,
  ): TNode | TNode[] | null {
    const schema = pmNode.type.schema;
    const name = this.nodeName(pmNode);

    const handler = this.nodeHandlers[name as keyof typeof this.nodeHandlers];
    if (handler) {
      // @ts-expect-error Fix types
      return handler(pmNode, parent, this);
    }
    if (pmNode.type === schema.topNodeType) {
      const children = this.handleAll(pmNode);
      return { type: "root", children } as unknown as TNode;
    }
    if (pmNode.type === schema.nodes.text) {
      // @ts-expect-error Fix types
      return this.textHandler(pmNode, parent, this) as TNode;
    }
    return null;
  }

  hydrateMarks(children: PmMarkedNode[], parent: ProseMirrorNode): TNode[] {
    const partitioned = children.reduce<PmMarkedNode[][]>((acc, child) => {
      const lastPartition = acc[acc.length - 1];
      if (!lastPartition) {
        return [[child]];
      }
      const lastChild = lastPartition[lastPartition.length - 1];
      if (!lastChild) {
        return [...acc.slice(0, acc.length), [child]];
      }

      if (
        (!child.marks.length && !lastChild.marks.length) ||
        (child.marks.length &&
          lastChild.marks.length &&
          child.marks[0]?.eq(lastChild.marks[0]))
      ) {
        return [
          ...acc.slice(0, acc.length - 1),
          [...lastPartition.slice(0, lastPartition.length), child],
        ];
      }

      return [...acc, [child]];
    }, []);

    // @ts-expect-error Improve type
    return (
      partitioned
        // @ts-expect-error Improve type
        .flatMap((nodes) => this.#processChildPartition(nodes, parent))
        .filter((node): node is TNode | TNode[] => !!node)
        .flat()
    );
  }

  #processChildPartition(nodes: PmMarkedNode[], parent: ProseMirrorNode) {
    const firstChild = nodes[0];
    const firstMark = firstChild?.marks[0];
    if (!firstMark) return nodes.map((node) => this.handle(node.node, parent));
    const children = this.hydrateMarks(
      nodes.map(({ node, marks }) => ({ node, marks: marks.slice(1) })),
      parent,
    );
    const handler = this.markHandlers[this.markName(firstMark)];
    if (!handler) return children;
    // @ts-expect-error fix types
    return handler(firstMark, parent, children, this);
  }
}
