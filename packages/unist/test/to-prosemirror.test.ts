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
import {
  fromMdastToProseMirror,
  toProseMirrorMark,
  toProseMirrorNode,
  type ToProseMirrorNodeHandlers,
} from "../src/mdast/index.js";
import { schema } from "prosemirror-test-builder";
import type { Root as MdastRoot } from "mdast";
import { markdownToUnist } from "@prosemirror-processor/markdown";

const defaultHandlers: ToProseMirrorNodeHandlers = {
  root(node, _, context) {
    const children = context.handleAll(node);
    return schema.topNodeType.create(null, children);
  },
  text(node) {
    return schema.text(String(node.value ?? ""));
  },
};

describe("fromUnistToProseMirror", async () => {
  it("should process a doc with paragraphs", async () => {
    const handlers: ToProseMirrorNodeHandlers = {
      ...defaultHandlers,
      paragraph: toProseMirrorNode(schema.nodes.paragraph!),
    };

    const unistNode = markdownToUnist(`
This is a document.

It has two paragraphs.
`);
    const doc = fromMdastToProseMirror(unistNode as MdastRoot, {
      nodeHandlers: handlers,
      schema,
    })!;

    assert.equal(doc.childCount, 2);
    assert.equal(doc.firstChild?.textContent, "This is a document.");
    assert.equal(doc.lastChild?.textContent, "It has two paragraphs.");
  });

  it("should process a doc with nested blocks", async () => {
    const handlers: ToProseMirrorNodeHandlers = {
      ...defaultHandlers,
      blockquote: toProseMirrorNode(schema.nodes["blockquote"]!),
      paragraph: toProseMirrorNode(schema.nodes["paragraph"]!),
    };

    const unistNode = markdownToUnist(`
This is a document.

> It has two paragraphs.
`);
    const doc = fromMdastToProseMirror(unistNode as MdastRoot, {
      nodeHandlers: handlers,
      schema,
    })!;

    assert.equal(doc.childCount, 2);
    assert.equal(doc.lastChild?.type.name, "blockquote");
    assert.equal(doc.lastChild?.firstChild?.type.name, "paragraph");
    assert.equal(
      doc.lastChild?.firstChild?.textContent,
      "It has two paragraphs.",
    );
  });

  it("should process marks", async () => {
    const handlers: ToProseMirrorNodeHandlers = {
      ...defaultHandlers,
      paragraph: toProseMirrorNode(schema.nodes["paragraph"]!),
      emphasis: toProseMirrorMark(schema.marks["em"]!),
    };

    const unistNode = markdownToUnist(`
This is a *document.*

It has two *paragraphs.*
`);
    const doc = fromMdastToProseMirror(unistNode as MdastRoot, {
      nodeHandlers: handlers,
      schema,
    })!;

    assert.equal(doc.childCount, 2);
    assert.equal(doc.firstChild?.textContent, "This is a document.");
    assert.equal(doc.lastChild?.textContent, "It has two paragraphs.");

    assert.ok(
      schema.marks["em"]?.isInSet(doc.firstChild?.lastChild?.marks ?? []),
    );
    assert.ok(
      schema.marks["em"]?.isInSet(doc.lastChild?.lastChild?.marks ?? []),
    );
  });

  it("should process nested marks", async () => {
    const handlers: ToProseMirrorNodeHandlers = {
      ...defaultHandlers,
      paragraph: toProseMirrorNode(schema.nodes["paragraph"]!),
      emphasis: toProseMirrorMark(schema.marks["em"]!),
      strong: toProseMirrorMark(schema.marks["strong"]!),
    };

    const unistNode = markdownToUnist(`
This is a **_document._**

It has two **_paragraphs._**
`);
    const doc = fromMdastToProseMirror(unistNode as MdastRoot, {
      nodeHandlers: handlers,
      schema,
    })!;

    assert.equal(doc.childCount, 2);
    assert.equal(doc.firstChild?.textContent, "This is a document.");
    assert.equal(doc.lastChild?.textContent, "It has two paragraphs.");

    assert.ok(
      schema.marks["em"]?.isInSet(doc.firstChild?.lastChild?.marks ?? []),
    );
    assert.ok(
      schema.marks["em"]?.isInSet(doc.lastChild?.lastChild?.marks ?? []),
    );

    assert.ok(
      schema.marks["strong"]?.isInSet(doc.firstChild?.lastChild?.marks ?? []),
    );
    assert.ok(
      schema.marks["strong"]?.isInSet(doc.lastChild?.lastChild?.marks ?? []),
    );
  });

  it("should process mark attrs", async () => {
    const handlers: ToProseMirrorNodeHandlers = {
      ...defaultHandlers,
      paragraph: toProseMirrorNode(schema.nodes["paragraph"]!),
      link: toProseMirrorMark(schema.marks["link"]!, (node) => ({
        href: node.url,
        title: node.title,
      })),
    };

    const unistNode = markdownToUnist(`
This is a [document.](https://github.com/handlewithcarecollective/remark-prosemirror)

It has two paragraphs.
`);
    const doc = fromMdastToProseMirror(unistNode as MdastRoot, {
      nodeHandlers: handlers,
      schema,
    })!;

    assert.equal(doc.childCount, 2);
    assert.equal(doc.firstChild?.textContent, "This is a document.");
    assert.equal(doc.lastChild?.textContent, "It has two paragraphs.");

    assert.ok(
      schema.marks["link"]?.isInSet(doc.firstChild?.lastChild?.marks ?? []),
    );
    assert.equal(
      doc.firstChild?.lastChild?.marks[0]?.attrs["href"],
      "https://github.com/handlewithcarecollective/remark-prosemirror",
    );
  });
});
