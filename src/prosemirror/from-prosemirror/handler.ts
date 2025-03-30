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
import type { FromProseMirrorParseContext } from "./context.js";

interface PmMarkedNode {
  node: ProseMirrorNode;
  marks: readonly ProseMirrorMark[];
}

function processChildPartition(
  context: FromProseMirrorParseContext,
  nodes: PmMarkedNode[],
  parent: ProseMirrorNode,
) {
  const firstChild = nodes[0];
  const firstMark = firstChild?.marks[0];
  if (!firstMark) return nodes.map((node) => context.handle(node.node, parent));
  const children = hydrateMarks(
    context,
    nodes.map(({ node, marks }) => ({ node, marks: marks.slice(1) })),
    parent,
  );
  const handler = context.markHandlers[context.markName(firstMark)];
  if (!handler) return children;
  return handler(firstMark, parent, children, context);
}

function hydrateMarks(
  context: FromProseMirrorParseContext,
  children: PmMarkedNode[],
  parent: ProseMirrorNode,
): Unist.Node[] {
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

  return partitioned
    .flatMap((nodes) => processChildPartition(context, nodes, parent))
    .filter((node): node is Unist.Node | Unist.Node[] => !!node)
    .flat();
}

export function handleAll(
  context: FromProseMirrorParseContext,
  pmNode: ProseMirrorNode,
): Unist.Node[] {
  return hydrateMarks(
    context,
    pmNode.children.map((child) => ({ node: child, marks: child.marks })),
    pmNode,
  );
}

export function handleOne(
  context: FromProseMirrorParseContext,
  pmNode: ProseMirrorNode,
  parent?: ProseMirrorNode,
): Unist.Node | Unist.Node[] | null {
  const schema = pmNode.type.schema;
  const name = context.nodeName(pmNode);

  const handler = context.nodeHandlers[name];
  if (handler) {
    return handler(pmNode, parent, context);
  }
  if (pmNode.type === schema.topNodeType) {
    const children = context.handleAll(pmNode);
    const parent: Unist.Parent = { type: "root", children };
    return parent;
  }
  if (pmNode.type === schema.nodes.text) {
    return context.textHandler(pmNode, parent, context);
  }
  return null;
}
