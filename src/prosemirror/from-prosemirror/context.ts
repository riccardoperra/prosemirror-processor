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

export type ProseMirrorNodeHandlers<TNodes extends string = string> = Record<
  TNodes,
  ProseMirrorNodeHandler
>;

export type ProseMirrorNodeHandler<TNode extends Unist.Node = Unist.Node> = (
  node: ProseMirrorNode,
  parent: ProseMirrorNode | undefined,
  context: FromProseMirrorParseContext,
) => TNode | TNode[] | null;

export type ProseMirrorMarkHandlers<TMarks extends string = string> = Record<
  TMarks,
  ProseMirrorMarkHandler
>;

export type ProseMirrorMarkHandler<TNode extends Unist.Node = Unist.Node> = (
  mark: Mark,
  node: ProseMirrorNode,
  children: TNode[],
  context: FromProseMirrorParseContext,
) => TNode | TNode[] | null;

export type FromProseMirrorParseContext<TNode extends Unist.Node = Unist.Node> =
  {
    nodeName: (node: ProseMirrorNode) => string;
    markName: (mark: ProseMirrorMark) => string;
    handle<T extends TNode | TNode[] | null>(
      pmNode: ProseMirrorNode,
      parent?: ProseMirrorNode,
    ): T;
    handleAll(pmNode: ProseMirrorNode): TNode[];
    textHandler: ProseMirrorNodeHandler;
    nodeHandlers: ProseMirrorNodeHandlers;
    markHandlers: ProseMirrorMarkHandlers;
  };

export interface FromProseMirrorCreateContextOptions<T extends Unist.Node> {
  nodeName: (pmNode: ProseMirrorNode) => string;
  markName: (mark: ProseMirrorMark) => string;
  textHandler: ProseMirrorNodeHandler;
  nodeHandlers: ProseMirrorNodeHandlers;
  markHandlers: ProseMirrorMarkHandlers;
}
