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
import type { Mark, Schema } from "prosemirror-model";

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
  schema: Schema;
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
  readonly schema: Schema;

  constructor({
    nodeName,
    markName,
    textHandler,
    nodeHandlers,
    markHandlers,
    schema,
  }: FromProseMirrorCreateContextOptions<TNode, TMark>) {
    this.nodeName = nodeName;
    this.markName = markName;
    this.textHandler = textHandler;
    this.nodeHandlers = nodeHandlers;
    this.markHandlers = markHandlers;
    this.schema = schema;
  }

  handleAll(pmNode: ProseMirrorNode): TNode[] {
    return this.processMarks(
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

  processMarks(children: PmMarkedNode[], parent: ProseMirrorNode): TNode[] {
    const partitioned: PmMarkedNode[][] = [];
    // Partition children into groups where:
    // - Nodes without marks are grouped together
    // - Nodes with the same first mark are grouped together
    for (const child of children) {
      const lastPartition = partitioned[partitioned.length - 1];

      // If there is no existing partition, create a new one
      if (!lastPartition || lastPartition.length === 0) {
        partitioned.push([child]);
        continue;
      }

      const lastChild = lastPartition[lastPartition.length - 1];

      // Check if the current child should be added to the last partition
      if (
        (!child.marks.length && !lastChild.marks.length) || // Both have no marks
        (child.marks.length &&
          lastChild.marks.length &&
          child.marks[0]?.eq(lastChild.marks[0])) // Both have the same first mark
      ) {
        lastPartition.push(child);
      } else {
        partitioned.push([child]); // Create a new partition
      }
    }

    const result: TNode[] = [];

    // Process each partitioned group of nodes
    for (const nodes of partitioned) {
      const processed = this.#processChildPartition(nodes, parent);
      if (processed) {
        // Flatten the result if necessary and add it to the final output
        // @ts-expect-error fix types
        result.push(...(Array.isArray(processed) ? processed : [processed]));
      }
    }

    return result;
  }

  #processChildPartition(nodes: PmMarkedNode[], parent: ProseMirrorNode) {
    const firstChild = nodes[0];
    const firstMark = firstChild?.marks[0];

    if (!firstMark) {
      // No marks, just process the nodes normally
      return nodes.map((node) => this.handle(node.node, parent));
    }

    // Recursively process the remaining marks
    const children = this.processMarks(
      nodes.map(({ node, marks }) => ({ node, marks: marks.slice(1) })),
      parent,
    );

    const handler = this.markHandlers[this.markName(firstMark)];
    // @ts-expect-error Fix types
    return handler ? handler(firstMark, parent, children, this) : children;
  }
}
