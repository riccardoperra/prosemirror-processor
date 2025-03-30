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
import type { ProseMirrorNode } from "../types.js";
import type { FromProseMirrorParseContext } from "./context.js";

function handleNode(
  context: FromProseMirrorParseContext,
  node: ProseMirrorNode,
  parent: ProseMirrorNode | undefined,
) {
  const resultNodes: Unist.Node[] = [];
  let convertedChildren: Unist.Node[] = [];
  for (let i = 0; i < node.childCount; ++i) {
    const child = node.child(i);
    convertedChildren = convertedChildren.concat(
      handleNode(context, child, node),
    );
  }

  for (let processedNode of convertedChildren) {
    for (const mark of node.marks) {
      let hasProcessedMark = false;
      const markHandler = context.markHandlers[mark.type.name];
      if (markHandler) {
        const result = markHandler(mark, node, [processedNode], context);
        if (result) {
          resultNodes.push(...(Array.isArray(result) ? result : [result]));
          hasProcessedMark = true;
        }
      }

      if (!hasProcessedMark) {
        console.warn(
          `Couldn't find any way to convert ProseMirror mark of type "${mark.type.name}" to a unist node.`,
        );
      }
    }
  }

  return resultNodes;
}

export function handleAll(
  context: FromProseMirrorParseContext,
  pmNode: ProseMirrorNode,
): Unist.Node[] {
  return handleNode(context, pmNode, undefined);
}

export function handleOne(
  context: FromProseMirrorParseContext,
  pmNode: ProseMirrorNode,
  parent?: ProseMirrorNode,
): Unist.Node | Unist.Node[] | null {
  const schema = pmNode.type.schema;
  const name = pmNode.type.name;

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
    return { type: "text", value: pmNode.text || "" } as Unist.Node;
  }

  return null;
}
