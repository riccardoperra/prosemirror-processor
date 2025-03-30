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

import {
  fromProseMirrorMark,
  type FromProseMirrorMarkFactory,
  fromProseMirrorNode,
  type FromProseMirrorNodeFactory,
} from "./utils.js";

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
  TNode extends Unist.Node,
  TRootNode extends Unist.Node = Unist.Node,
> {
  createContext: (
    options: FromProseMirrorCreateContextOptions<TNode>,
  ) => FromProseMirrorParseContext<TNode>;

  fromProseMirrorToUnist: (
    pmNode: ProseMirrorNode,
    options: FromProseMirrorToUnistOptions,
  ) => TRootNode;

  fromProseMirrorNode: FromProseMirrorNodeFactory<TNode>;

  fromProseMirrorMark: FromProseMirrorMarkFactory<TNode>;
}

export function createContext<T extends Unist.Node>(
  options: FromProseMirrorCreateContextOptions<T>,
): FromProseMirrorParseContext<T> {
  const { nodeHandlers, markHandlers, textHandler, name } = options;
  return {
    name,
    nodeHandlers,
    markHandlers,
    textHandler,
    handle<TNode extends T[] | T | null>(
      pmNode: ProseMirrorNode,
      parent?: ProseMirrorNode,
    ): TNode {
      return handleOne(this, pmNode, parent) as TNode;
    },
    handleAll(pmNode: ProseMirrorNode): T[] {
      return handleAll(this, pmNode) as T[];
    },
  };
}

export function createFromProseMirrorParser<
  TNode extends Unist.Node,
  TRootNode extends Unist.Node = Unist.Node,
>(): FromProseMirrorParser<TNode, TRootNode> {
  type Res = FromProseMirrorParser<TNode, TRootNode>;
  const _createContext = createContext<TNode>;
  const _fromProseMirrorToUnist = fromProseMirrorToUnist<TRootNode>;

  return {
    createContext: _createContext,
    fromProseMirrorToUnist: _fromProseMirrorToUnist,
    fromProseMirrorNode:
      fromProseMirrorNode as unknown as Res["fromProseMirrorNode"],
    fromProseMirrorMark:
      fromProseMirrorMark as unknown as Res["fromProseMirrorMark"],
  };
}
