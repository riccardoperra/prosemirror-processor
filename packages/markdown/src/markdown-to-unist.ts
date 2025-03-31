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

import remarkGfm from "remark-gfm";
import type { Options as RemarkParseOptions } from "remark-parse";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { VFile, VFileCompatible } from "vfile";
import type { Node as UnistNode, Root } from "mdast";

export type RemarkHandler = (tree: Root, vfile: VFile) => void;
export type TransformerRemarkHandler = (
  options?: Record<any, any>,
) => RemarkHandler;

export interface MarkdownToUnistOptions {
  compatible?: VFileCompatible;
  transformers?: TransformerRemarkHandler[];
  remarkParseOptions?: RemarkParseOptions;
}

export function markdownToUnist(
  content: string,
  options: MarkdownToUnistOptions = {},
): UnistNode {
  const { compatible, transformers } = options;
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(
      (transformers ?? []).map((transformer) => {
        return function handler(this: unknown) {
          return transformer.call(this, {}); // Use call to keep context
        };
      }),
    );

  const parsed = processor.parse(content);

  return processor.runSync(parsed, compatible);
}
