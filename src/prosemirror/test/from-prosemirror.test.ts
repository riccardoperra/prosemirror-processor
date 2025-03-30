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
import { assert, describe, it } from "vitest";
import { unified } from "unified";
import remarkStringify from "remark-stringify";
import {
  createFromProseMirrorParser,
  pmTextHandler,
} from "../from-prosemirror.js";
import {
  blockquote,
  doc,
  em,
  p,
  schema as schemaUntyped,
  strong,
} from "prosemirror-test-builder";
import { Schema } from "prosemirror-model";
import type * as Mdast from "mdast";

const schema = schemaUntyped as unknown as Schema<
  "paragraph" | "blockquote",
  "link" | "em" | "strong"
>;

const stringifyUtils = {
  fences: true,
  listItemIndent: "one",
  resourceLink: true,
  bullet: "-",
  bulletOrdered: ".",
  emphasis: "_",
  incrementListMarker: true,
  rule: "-",
  // ruleSpaces: true,
  strong: "*",
};

const { fromProseMirrorToUnist, fromProseMirrorNode, fromProseMirrorMark } =
  createFromProseMirrorParser<Mdast.Nodes, Mdast.Root>();

describe("mdast-util-from-prosemirror", async () => {
  it("should process a doc with paragraphs", () => {
    const mdast = fromProseMirrorToUnist(
      doc(p("This is a document."), p("It has two paragraphs.")),
      {
        nodeName: (node) => node.type.name,
        markName: (node) => node.type.name,
        schema,
        textHandler: pmTextHandler,
        nodeHandlers: {
          paragraph: fromProseMirrorNode("paragraph"),
        },
        markHandlers: {},
      },
    );
    const result = unified().use(remarkStringify).stringify(mdast);

    assert.equal(
      result,
      `This is a document.

It has two paragraphs.
`,
    );
  });

  it("should process a doc with nested blocks", () => {
    const mdast = fromProseMirrorToUnist(
      doc(p("This is a document."), blockquote(p("It has two paragraphs."))),
      {
        nodeName: (node) => node.type.name,
        markName: (node) => node.type.name,
        schema,
        textHandler: pmTextHandler,
        nodeHandlers: {
          paragraph: fromProseMirrorNode("paragraph"),
          blockquote: fromProseMirrorNode("blockquote"),
        },
        markHandlers: {},
      },
    );
    const result = unified().use(remarkStringify).stringify(mdast);

    assert.equal(
      result,
      `This is a document.

> It has two paragraphs.
`,
    );
  });

  it("should process a doc with marks", () => {
    const mdast = fromProseMirrorToUnist(
      doc(p("This is a ", em("document.")), p("It has two paragraphs.")),
      {
        nodeName: (node) => node.type.name,
        markName: (node) => node.type.name,
        schema,
        textHandler: pmTextHandler,
        nodeHandlers: {
          paragraph: fromProseMirrorNode("paragraph"),
          blockquote: fromProseMirrorNode("blockquote"),
        },
        markHandlers: {
          em: fromProseMirrorMark("emphasis"),
        },
      },
    );
    const result = unified().use(remarkStringify).stringify(mdast);

    assert.equal(
      result,
      `This is a *document.*

It has two paragraphs.
`,
    );
  });

  it("should process mark attrs", () => {
    const mdast = fromProseMirrorToUnist(
      doc(
        p(
          "This is a ",
          schema.text("document.", [
            schema.marks.link.create({
              href: "https://github.com/handlewithcarecollective/remark-prosemirror",
            }),
          ]),
        ),
        p("It has two paragraphs."),
      ),
      {
        nodeName: (node) => node.type.name,
        markName: (node) => node.type.name,
        schema,
        textHandler: pmTextHandler,
        nodeHandlers: {
          paragraph: fromProseMirrorNode("paragraph"),
          blockquote: fromProseMirrorNode("blockquote"),
        },
        markHandlers: {
          link: fromProseMirrorMark("link", (mark) => ({
            url: mark.attrs["href"] as string,
          })),
        },
      },
    );
    const result = unified().use(remarkStringify).stringify(mdast);

    assert.equal(
      result,
      `This is a [document.](https://github.com/handlewithcarecollective/remark-prosemirror)

It has two paragraphs.
`,
    );
  });

  it("should process a doc with nested marks", () => {
    const mdast = fromProseMirrorToUnist(
      doc(
        p("This ", em("is a ", strong("document."))),
        p("It has two paragraphs."),
      ),
      {
        nodeName: (node) => node.type.name,
        markName: (node) => node.type.name,
        schema,
        textHandler: pmTextHandler,
        nodeHandlers: {
          paragraph: fromProseMirrorNode("paragraph"),
          blockquote: fromProseMirrorNode("blockquote"),
        },
        markHandlers: {
          em: fromProseMirrorMark("emphasis"),
          strong: fromProseMirrorMark("strong"),
        },
      },
    );
    const result = unified().use(remarkStringify).stringify(mdast);

    assert.equal(
      result,
      `This *is a **document.***

It has two paragraphs.
`,
    );
  });
});
