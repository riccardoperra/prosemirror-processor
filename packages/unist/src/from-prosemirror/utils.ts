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

import type {
  ProseMirrorMarkToUnistHandler,
  ProseMirrorNodeToUnistHandler,
} from "./context.js";

import type * as Unist from "unist";
import type { ProseMirrorMark, ProseMirrorNode } from "../types.js";

export const pmTextHandler: ProseMirrorNodeToUnistHandler = (pmNode) => {
  return { type: "text", value: pmNode.text || "" };
};

export function fromProseMirrorNode<Type extends Unist.Node["type"]>(
  type: Type,
  getAttrs?: (
    pmNode: ProseMirrorNode,
  ) => Omit<Extract<Unist.Node, { type: Type }>, "type" | "children">,
): ProseMirrorNodeToUnistHandler {
  return (node, _, context) => {
    const children = context.handleAll(node);
    return {
      type,
      ...getAttrs?.(node),
      children,
    };
  };
}

export function fromProseMirrorMark<Type extends Unist.Node["type"]>(
  type: Type,
  getAttrs?: (
    pmNode: ProseMirrorMark,
  ) => Omit<Extract<Unist.Node, { type: Type }>, "type" | "children">,
): ProseMirrorMarkToUnistHandler {
  return (mark, _, mdastChildren) => {
    return {
      type,
      ...getAttrs?.(mark),
      children: mdastChildren,
    };
  };
}
