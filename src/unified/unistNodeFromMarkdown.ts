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
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { VFile, VFileCompatible } from "vfile";
import type { Node as UnistNode, Root } from "mdast";
import type { Options as RemarkParseOptions } from "remark-parse";

type RemarkHandler = (tree: Root, vfile: VFile) => void;
type TransformerRemarkHandler = (options?: Record<any, any>) => RemarkHandler;
type TransformerRemarkPlugin = {
  type: "remarkPlugin";
  handler: TransformerRemarkHandler;
};

export interface UnistNodeFromMarkdownOptions {
  vfile?: VFileCompatible;
  transformers?: TransformerRemarkPlugin[];
  remarkParseOptions?: RemarkParseOptions;
}

export function unistNodeFromMarkdown(
  content: string,
  options: UnistNodeFromMarkdownOptions = {},
): UnistNode {
  const { vfile, transformers, remarkParseOptions } = options;
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(
      (transformers ?? []).map((transformer) => {
        return function handler() {
          // @ts-expect-error fix
          return transformer.handler.call(this, {}); // Use call to keep context
        };
      }),
    );

  const parsed = processor.parse(content);
  return processor.runSync(parsed, vfile);
}
