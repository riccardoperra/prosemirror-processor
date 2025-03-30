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

import type { Node as $UnistNode } from "unist";
import type {
  Node as $ProseMirrorNode,
  Mark as $ProseMirrorMark,
  Schema,
} from "prosemirror-model";

export type UnistNode = $UnistNode;
export type ProseMirrorNode = $ProseMirrorNode;
export type ProseMirrorMark = $ProseMirrorMark;

declare module "prosemirror-model" {
  interface NodeSpec {
    unistName?: string;
    unistToNode?: (
      node: UnistNode,
      schema: Schema<string, string>,
      children: ProseMirrorNode[],
      context: Record<string, unknown>,
    ) => ProseMirrorNode[];

    toUnist?: (
      node: ProseMirrorNode,
      children: UnistNode[],
      schema: Schema<string, string>,
    ) => UnistNode[];
  }

  interface MarkSpec {
    unistName?: string;
    unistToNode?: (
      node: UnistNode,
      schema: Schema<string, string>,
      children: ProseMirrorNode[],
      context: Record<string, unknown>,
    ) => ProseMirrorNode[];
    toUnist?: (
      convertedNode: UnistNode,
      mark: Mark,
      schema: Schema<string, string>,
    ) => UnistNode;
  }
}
