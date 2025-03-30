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

import { type Attrs, Fragment, MarkType, NodeType } from "prosemirror-model";
import type { ProseMirrorNode } from "./types.js";

export interface ProseMirrorNodeCreatorOptions {
  mode: "fill" | "checked";
}

export type ProseMirrorNodeCreatorResult<
  TOptions extends ProseMirrorNodeCreatorOptions,
> = "fill" extends TOptions["mode"]
  ? ProseMirrorNode | null
  : "checked" extends TOptions["mode"]
    ? ProseMirrorNode
    : ProseMirrorNode | null;

export function pmNode<TOptions extends ProseMirrorNodeCreatorOptions>(
  nodeType: NodeType,
  children: Fragment | ProseMirrorNode | readonly ProseMirrorNode[] | null,
  attrs: Attrs | null,
  options?: TOptions,
): ProseMirrorNodeCreatorResult<TOptions> {
  const mode: "fill" | "checked" = options?.mode ?? "fill";

  const node =
    mode === "fill"
      ? nodeType.createAndFill(attrs ?? null, children)
      : nodeType.createChecked(attrs);

  return node as ProseMirrorNodeCreatorResult<TOptions>;
}

export function pmMark(
  markType: MarkType,
  children: readonly ProseMirrorNode[],
  attrs: Attrs | null,
): ProseMirrorNode[] {
  const mark = markType.create(attrs);
  return children.map((child) => child.mark(mark.addToSet(child.marks)));
}
