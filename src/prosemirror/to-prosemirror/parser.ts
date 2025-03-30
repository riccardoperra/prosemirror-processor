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
import type {
  ToProseMirrorCreateContextOptions,
  ToProseMirrorParseContext,
} from "./context.js";
import type * as Unist from "unist";
import { handle, handleAll } from "./handler.js";

export interface FromUnistToProseMirrorOptions<
  TProseMirrorNodes extends string = string,
> {
  nodeHandlers: ProseMirrorNodeHandlers<TProseMirrorNodes>;
}

export function fromUnistToProseMirror<TNode extends Unist.Node>(
  unistNode: TNode,
  options: FromUnistToProseMirrorOptions,
): ProseMirrorNode | null {
  const context = createContext({
    nodeHandlers: options.nodeHandlers,
  });
  const result = context.handle(unistNode, undefined);
  if (
    Array.isArray(result) &&
    result[0] &&
    result[0].type === result[0].type.schema.topNodeType
  ) {
    return result[0];
  }
  return result;
}

export interface ToProseMirrorParser<
  TNode extends Unist.Node,
  TRootNode extends Unist.Node = Unist.Node,
> {
  createContext: (
    options: ToProseMirrorCreateContextOptions<TNode>,
  ) => ToProseMirrorParseContext<TNode>;

  fromUnistToProseMirror: (
    unist: TRootNode,
    options: FromUnistToProseMirrorOptions,
  ) => ProseMirrorNode;
}

export function createContext<T extends Unist.Node>(
  options: ToProseMirrorCreateContextOptions<T>,
): ToProseMirrorParseContext<T> {
  const { nodeHandlers } = options;
  return {
    nodeHandlers,
    handle(node, parent) {
      return handle(this, node, parent);
    },
    handleAll(parent) {
      return handleAll(this, parent);
    },
  };
}

export function createToProseMirrorParser<
  TNode extends Unist.Node,
  TRootNode extends Unist.Node = Unist.Node,
>(): ToProseMirrorParser<TNode, TRootNode> {
  type Res = ToProseMirrorParser<TNode, TRootNode>;
  const _createContext = createContext<TNode>;
  const _fromUnistToProseMirror = fromUnistToProseMirror<TRootNode>;

  return {
    createContext: _createContext,
    fromUnistToProseMirror: _fromUnistToProseMirror,
  };
}
