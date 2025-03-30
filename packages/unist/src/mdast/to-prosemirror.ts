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
  type FromUnistToProseMirror,
  fromUnistToProseMirrorFactory,
  type FromUnistToProseMirrorOptions,
  type ToProseMirrorNodeHandlers as CoreToProseMirrorNodeHandlers,
  UnistToProseMirrorParseContext,
  type ToProseMirrorNodeHandler as CoreToProseMirrorNodeHandler,
} from "../index.js";

import type * as Mdast from "mdast";
import type { Schema } from "prosemirror-model";

export type FromMdastToProseMirror = FromUnistToProseMirror<Mdast.Nodes>;

export type ToProseMirrorNodeHandlers =
  CoreToProseMirrorNodeHandlers<Mdast.Nodes>;

export type ToProseMirrorNodeHandler<TMdastNode extends Mdast.Nodes> =
  CoreToProseMirrorNodeHandler<TMdastNode>;

export type FromMdastToProseMirrorOptions =
  FromUnistToProseMirrorOptions<Mdast.Nodes>;

export const fromMdastToProseMirror: FromMdastToProseMirror =
  fromUnistToProseMirrorFactory<Mdast.Nodes>();

export interface MdastToProseMirrorParseContext
  extends UnistToProseMirrorParseContext<Mdast.Nodes, Mdast.Parent> {}

export { toProseMirrorNode, toProseMirrorMark } from "../index.js";
