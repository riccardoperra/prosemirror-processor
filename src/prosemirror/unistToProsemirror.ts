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

import type { Root } from "mdast";
import type { UnistNode } from "./types.js";
import type { Node as ProseMirrorNode, Schema } from "prosemirror-model";

function convertNode(node: ProseMirrorNode, schema: Schema) {
  let convertedNodes: UnistNode[] | null = null;
  let convertedChildren: UnistNode[] = [];
  for (let i = 0; i < node.childCount; ++i) {
    const child = node.child(i);
    convertedChildren = convertedChildren.concat(convertNode(child, schema));
  }

  if (node.type.spec.toUnist) {
    convertedNodes = node.type.spec.toUnist(node, convertedChildren, schema);
  }

  if (convertedNodes === null) {
    console.warn(
      `Couldn't find any way to convert ProseMirror node of type "${node.type.name}" to a unist node.`,
    );
    return [];
  }

  return convertedNodes.map((convertedNode) => {
    let postProcessedNode = convertedNode;
    for (const mark of node.marks) {
      let processed = false;
      if (mark.type.spec.toUnist) {
        postProcessedNode = mark.type.spec.toUnist(
          postProcessedNode,
          mark,
          schema,
        );
        processed = true;
      }
      if (!processed) {
        console.warn(
          `Couldn't find any way to convert ProseMirror mark of type "${mark.type.name}" to a unist node.`,
        );
      }
    }
    return postProcessedNode;
  });
}

export function convertPmSchemaToUnist(
  node: ProseMirrorNode,
  schema: Schema,
  options?: Partial<{ postProcess: (node: Root) => void }>,
): UnistNode {
  const rootNode = convertNode(node, schema);
  if (rootNode.length !== 1) {
    throw new Error(
      "Couldn't find any way to convert the root ProseMirror node.",
    );
  }
  const result = rootNode[0];
  if (options?.postProcess) {
    options.postProcess(result as Root);
  }
  return result;
}
