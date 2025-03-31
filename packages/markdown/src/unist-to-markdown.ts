import { type Processor, unified } from "unified";
import type { Options as RehypeParseOptions } from "rehype-parse";
import rehypeParse from "rehype-parse";
import remarkGfm from "remark-gfm";
import remarkStringify, {
  type Options as RemarkStringifyOptions,
} from "remark-stringify";
import type { Root } from "mdast";
import type { Compatible } from "vfile";

export interface UnistToMarkdownOptions {
  stringifyOptions: RemarkStringifyOptions;
  rehypeParseOptions: RehypeParseOptions;
  compatible?: Compatible;
  processor: <
    TProcessor extends Processor<Root, undefined, undefined, Root, string>,
  >(
    processor: Processor<Root>,
  ) => TProcessor;
}

const defaultStringifyOptions: RemarkStringifyOptions = {
  fences: true,
  listItemIndent: "one",
  resourceLink: true,
  bullet: "-",
  bulletOrdered: ".",
  emphasis: "*",
  incrementListMarker: true,
  rule: "-",
  strong: "*",
};

export function unistToMarkdown<T extends Root>(
  rootNode: T,
  options?: Partial<UnistToMarkdownOptions>,
): string {
  const stringifyOptions = {
    ...defaultStringifyOptions,
    ...(options?.stringifyOptions ?? {}),
  };

  const baseProcessor = unified()
    .use(rehypeParse, options?.rehypeParseOptions)
    .use(remarkGfm)
    .use(remarkStringify, stringifyOptions);

  const processor = options?.processor
    ? options.processor(baseProcessor as unknown as Processor<Root>)
    : baseProcessor;

  return processor.stringify(rootNode, options?.compatible);
}
