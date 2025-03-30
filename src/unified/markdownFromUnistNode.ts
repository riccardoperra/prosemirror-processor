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

import rehypeParse from "rehype-parse";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import type { Root } from "mdast";

export function markdownFromUnistNode(rootNode: Root): string {
  const processor = unified()
    .use(rehypeParse)
    .use(remarkGfm)
    .use(remarkStringify, {
      fences: true,
      listItemIndent: "one",
      resourceLink: true,
      bullet: "-",
      bulletOrdered: ".",
      emphasis: "*",
      incrementListMarker: true,
      rule: "-",
      // ruleSpaces: true,
      strong: "*",
    });

  return processor.stringify(rootNode);
}
