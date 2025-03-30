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

export type HastNodeHandlers<TNodes extends string = string> = Record<
  TNodes,
  HastNodeHandler<Unist.Node>
>;

export type HastNodeHandler<TNode extends Unist.Node = Unist.Node> = (
  node: TNode,
  parent: TNode | undefined,
  state: ToProseMirrorParseContext,
) => ProseMirrorNode | ProseMirrorNode[] | null;

export type ToProseMirrorParseContext<TNode extends Unist.Node = Unist.Node> = {
  nodeHandlers: HastNodeHandlers<TNode["type"]>;
  handleAll: (parent: Unist.Node) => ProseMirrorNode[];
  handle: (
    node: Unist.Node,
    parent: Unist.Node | undefined,
  ) => ProseMirrorNode[];
};

export interface ToProseMirrorCreateContextOptions<TNode extends Unist.Node> {
  nodeHandlers: HastNodeHandlers<TNode["type"]>;
}
