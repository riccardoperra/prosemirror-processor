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

import type { Schema } from "prosemirror-model";
import type { ProseMirrorMark, ProseMirrorNode } from "../types.js";
import {
  type ProseMirrorMarkToUnistHandlers,
  type ProseMirrorNodeToUnistHandlers,
  type ProseMirrorNodeToUnistHandler,
  ProseMirrorToUnistParseContext,
} from "./context.js";
import type * as Unist from "unist";

export interface FromProseMirrorToUnistOptions<
  TSchema extends Schema = Schema,
  TNodes extends Unist.Node = Unist.Node,
  TMarks extends Unist.Node = Unist.Node,
> {
  schema: TSchema;
  nodeName: (pmNode: ProseMirrorNode) => string;
  markName: (pmNode: ProseMirrorMark) => string;
  textHandler: ProseMirrorNodeToUnistHandler;
  nodeHandlers: ProseMirrorNodeToUnistHandlers<TNodes>;
  markHandlers: ProseMirrorMarkToUnistHandlers<TMarks>;
}

export function fromProseMirrorToUnist<
  TSchema extends Schema = Schema,
  TNode extends Unist.Node = Unist.Node,
  TMark extends Unist.Node = Unist.Node,
>(
  pmNode: ProseMirrorNode,
  options: FromProseMirrorToUnistOptions<TSchema, TNode, TMark>,
): TNode | TNode[] | null {
  const context = new ProseMirrorToUnistParseContext({
    nodeName: options.nodeName,
    markName: options.markName,
    textHandler: options.textHandler,
    nodeHandlers: options.nodeHandlers,
    markHandlers: options.markHandlers,
  });
  return context.handle(pmNode, undefined);
}
