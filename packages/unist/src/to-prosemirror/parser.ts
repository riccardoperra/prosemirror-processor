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

import type { ProseMirrorNode } from "../types.js";
import {
  type ToProseMirrorNodeHandlers,
  UnistToProseMirrorParseContext,
} from "./context.js";
import type * as Unist from "unist";
import type { Schema } from "prosemirror-model";

export interface FromUnistToProseMirrorOptions<
  TNode extends Unist.Node = Unist.Node,
> {
  schema: Schema;
  nodeHandlers: ToProseMirrorNodeHandlers<TNode>;
}

export type FromUnistToProseMirror<TNode extends Unist.Node> = (
  unistNode: TNode,
  options: FromUnistToProseMirrorOptions<TNode>,
) => ProseMirrorNode | null;

export function fromUnistToProseMirrorFactory<
  TNode extends Unist.Node,
>(): FromUnistToProseMirror<TNode> {
  return fromUnistToProseMirror as FromUnistToProseMirror<TNode>;
}

export const fromUnistToProseMirror: FromUnistToProseMirror<Unist.Node> = (
  unistNode,
  options,
) => {
  const context = new UnistToProseMirrorParseContext(
    options.schema,
    options.nodeHandlers,
  );
  const result = context.handle(unistNode, undefined);
  if (
    Array.isArray(result) &&
    result[0] &&
    result[0].type === result[0].type.schema.topNodeType
  ) {
    return result[0];
  }
  return result as never;
};
