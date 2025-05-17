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
import type { Schema } from "prosemirror-model";

export type ToProseMirrorNodeHandlers<TNode extends Unist.Node = Unist.Node> = {
  [Type in TNode["type"]]?: ToProseMirrorNodeHandler<
    Extract<TNode, { type: Type }>
  >;
};

export type ToProseMirrorNodeHandler<TNode extends Unist.Node = Unist.Node> = (
  node: TNode,
  parent: TNode | undefined,
  context: UnistToProseMirrorParseContext,
) => ProseMirrorNode | ProseMirrorNode[] | null;

export class UnistToProseMirrorParseContext<
  TNode extends Unist.Node = Unist.Node,
  TParentNode extends Unist.Parent = Unist.Parent,
> {
  readonly schema: Schema;
  readonly nodeHandlers: ToProseMirrorNodeHandlers<TNode>;
  readonly unknownHandler: ToProseMirrorNodeHandler | undefined;

  constructor(
    schema: Schema,
    nodeHandlers: ToProseMirrorNodeHandlers<TNode>,
    unknownHandler: ToProseMirrorNodeHandler | undefined,
  ) {
    this.schema = schema;
    this.nodeHandlers = nodeHandlers;
    this.unknownHandler = unknownHandler;
  }

  handleAll(parent: TParentNode): ProseMirrorNode[] {
    const values: ProseMirrorNode[] = [];
    if ("children" in parent) {
      const nodes = parent.children as TNode[];
      let index = -1;
      while (++index < nodes.length) {
        let result = this.handle(nodes[index]!, parent);
        if (result) {
          if (Array.isArray(result)) {
            values.push(...result);
          } else {
            values.push(result);
          }
        }
      }
    }
    return values;
  }

  handle(
    unistNode: TNode,
    parent: TParentNode | undefined = undefined,
  ): ProseMirrorNode | ProseMirrorNode[] | null {
    const type = unistNode.type;
    // @ts-expect-error TODO: Improve types
    let handler = this.nodeHandlers[type];
    if (!handler) {
      if (!this.unknownHandler) {
        console.warn(
          `Couldn't find any way to convert unist node of type "${type}" to a ProseMirror node.`,
        );
        return [];
      }
      handler = this.unknownHandler;
    }
    const result = handler(unistNode, parent, this);
    if (!result) return [];
    return Array.isArray(result) ? result : [result];
  }
}
