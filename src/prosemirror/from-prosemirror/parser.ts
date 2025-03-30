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
import type { ProseMirrorNode } from "../types.js";
import type {
  FromProseMirrorCreateContextOptions,
  FromProseMirrorParseContext,
  ProseMirrorMarkHandlers,
  ProseMirrorNodeHandler,
  ProseMirrorNodeHandlers,
} from "./context.js";
import type * as Unist from "unist";
import { handleAll, handleOne } from "./handler.js";

export interface FromProseMirrorToUnistOptions<
  TProseMirrorNodes extends string = string,
  TProseMirrorMarks extends string = string,
> {
  schema: Schema<TProseMirrorNodes, TProseMirrorMarks>;
  name: (pmNode: ProseMirrorNode) => string;
  textHandler: ProseMirrorNodeHandler;
  nodeHandlers: ProseMirrorNodeHandlers<TProseMirrorNodes>;
  markHandlers: ProseMirrorMarkHandlers<TProseMirrorMarks>;
}

export function fromProseMirrorToUnist<TNode extends Unist.Node>(
  pmNode: ProseMirrorNode,
  options: FromProseMirrorToUnistOptions,
): TNode {
  const context = createContext({
    name: options.name,
    textHandler: options.textHandler,
    nodeHandlers: options.nodeHandlers,
    markHandlers: options.markHandlers,
  });
  return context.handle<TNode>(pmNode, undefined);
}

export interface FromProseMirrorParser<
  T extends Unist.Node,
  TRootNode extends Unist.Node = Unist.Node,
> {
  createContext: (
    options: FromProseMirrorCreateContextOptions<T>,
  ) => FromProseMirrorParseContext<T>;

  fromProseMirrorToUnist: (
    pmNode: ProseMirrorNode,
    options: FromProseMirrorToUnistOptions,
  ) => TRootNode;
}

export function createContext<T extends Unist.Node>(
  options: FromProseMirrorCreateContextOptions<T>,
): FromProseMirrorParseContext<T> {
  const { nodeHandlers, markHandlers, textHandler, name } = options;
  const _handleCache = new WeakMap<ProseMirrorNode, unknown>();
  const _handleAllCache = new WeakMap<ProseMirrorNode, unknown>();
  return {
    name,
    nodeHandlers,
    markHandlers,
    textHandler,
    handle<TNode extends T[] | T | null>(
      pmNode: ProseMirrorNode,
      parent?: ProseMirrorNode,
    ): TNode {
      if (_handleCache.has(pmNode)) return _handleCache.get(pmNode) as TNode;
      const result = handleOne(this, pmNode, parent) as TNode;
      _handleCache.set(pmNode, result);
      return result;
    },
    handleAll(pmNode: ProseMirrorNode): T[] {
      if (_handleAllCache.has(pmNode))
        return _handleAllCache.get(pmNode) as T[];
      const result = handleAll(this, pmNode) as T[];
      _handleAllCache.set(pmNode, result);
      return result;
    },
  };
}

export function createFromProseMirrorParser<
  TNode extends Unist.Node,
  TRootNode extends Unist.Node = Unist.Node,
>(): FromProseMirrorParser<TNode, TRootNode> {
  const _createContext = createContext<TNode>;
  const _fromProseMirrorToUnist = fromProseMirrorToUnist<TRootNode>;

  return {
    createContext: _createContext,
    fromProseMirrorToUnist: _fromProseMirrorToUnist,
  };
}
