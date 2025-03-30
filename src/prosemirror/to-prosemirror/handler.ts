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
import type { ToProseMirrorParseContext } from "./context.js";
import type { ProseMirrorNode } from "../types.js";

export function handleAll(
  context: ToProseMirrorParseContext,
  parent: Unist.Node,
): ProseMirrorNode[] {
  const values: ProseMirrorNode[] = [];

  if ("children" in parent) {
    const nodes = parent.children as Unist.Node[];
    let index = -1;
    while (++index < nodes.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let result = context.handle(nodes[index]!, parent as Unist.Node);

      if (result) {
        if (Array.isArray(result)) {
          values.push(...result);
        } else {
          values.push(result);
        }
      }
    }
  }

  return values;
}

export function handle(
  context: ToProseMirrorParseContext,
  unistNode: Unist.Node,
  parent: Unist.Node | undefined,
): ProseMirrorNode | ProseMirrorNode[] | null {
  let type = unistNode.type;

  const handler = context.nodeHandlers[type];
  if (!handler) {
    console.warn(
      `Couldn't find any way to convert unist node of type "${type}" to a ProseMirror node.`,
    );
    return [];
  }

  // const convertedChildren = [] as ProseMirrorNode[];
  // if ("children" in unistNode && Array.isArray(unistNode.children)) {
  //   for (const child of unistNode.children as Unist.Node[]) {
  //     convertedChildren.push(...context.handle(child, unistNode));
  //   }
  // }

  const result = handler(unistNode, parent, context);
  if (!result) return [];
  return Array.isArray(result) ? result : [result];
}
