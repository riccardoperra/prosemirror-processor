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

import {
  fromProseMirrorToUnist,
  type FromProseMirrorToUnistOptions,
  type ProseMirrorMark,
  type ProseMirrorMarkToUnistHandler,
  type ProseMirrorMarkToUnistHandlers,
  type ProseMirrorNodeToUnistHandler,
  type ProseMirrorNodeToUnistHandlers,
} from "../index.js";

import type * as Mdast from "mdast";
import type { Schema } from "prosemirror-model";
import type { ProseMirrorNode } from "../types.js";
import type * as Unist from "unist";

export type FromProseMirrorToMdastOptions<
  TSchema extends Schema,
  TNode extends Mdast.Nodes,
  TMark extends Mdast.Nodes,
> = FromProseMirrorToUnistOptions<TSchema, TNode, TMark>;

export function fromProseMirrorToMdast<
  TSchema extends Schema,
  TNode extends Mdast.Nodes,
  TMark extends Mdast.Nodes,
>(
  pmNode: ProseMirrorNode,
  options: FromProseMirrorToUnistOptions<TSchema, TNode, TMark>,
): TNode | TNode[] | null {
  return fromProseMirrorToUnist(pmNode, options);
}

export type ProseMirrorMarkToMdastHandler<
  TNode extends Mdast.Node,
  TMark extends Mdast.Node,
> = ProseMirrorMarkToUnistHandler<TNode, TMark>;

export type ProseMirrorNodeToMdastHandler<
  TNode extends Mdast.Node,
  TMark extends Mdast.Node,
> = ProseMirrorNodeToUnistHandler<TNode, TMark>;

export type ProseMirrorMarkToMdastHandlers =
  ProseMirrorMarkToUnistHandlers<Mdast.Nodes>;

export type ProseMirrorNodeToMdastHandlers =
  ProseMirrorNodeToUnistHandlers<Mdast.Nodes>;

import {
  fromProseMirrorMark as coreFromProseMirrorMark,
  fromProseMirrorNode as coreFromProseMirrorNode,
} from "../index.js";

export function fromProseMirrorNode<
  TNodes extends Mdast.Nodes,
  Type extends TNodes["type"],
>(
  type: Type,
  getAttrs?: (
    pmNode: ProseMirrorNode,
  ) => Omit<Extract<TNodes, { type: Type }>, "type" | "children">,
): ProseMirrorNodeToUnistHandler<TNodes> {
  // @ts-expect-error Fix types
  return coreFromProseMirrorNode(type, getAttrs);
}

export function fromProseMirrorMark<
  TNodes extends Mdast.Nodes,
  Type extends TNodes["type"],
>(
  type: Type,
  getAttrs?: (
    pmNode: ProseMirrorMark,
  ) => Omit<Extract<TNodes, { type: Type }>, "type" | "children">,
): ProseMirrorMarkToUnistHandler<TNodes> {
  // @ts-expect-error Fix types
  return coreFromProseMirrorMark(type, getAttrs);
}
