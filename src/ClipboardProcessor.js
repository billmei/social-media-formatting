import React, { useState } from "react";
import { parse, serialize } from "parse5";

const ClipboardProcessor = () => {
  const [input, setInput] = useState("");
  const [plainTextOutput, setPlainTextOutput] = useState("");
  const [formattedOutput, setFormattedOutput] = useState("");

  const processClipboard = (text) => {
    let counter = 1;
    const referenceMap = new Map();
    const document = parse(text);

    const processNodePlainText = (node) => {
      if (node.nodeName === "#text") {
        return node.value;
      }

      if (node.nodeName === "a" || node.nodeName === "sup") {
        const content = node.childNodes.map(processNodePlainText).join("");
        if (node.nodeName === "a") {
          referenceMap.set(counter, content);
          return `${content}[${counter++}]`;
        } else if (node.nodeName === "sup") {
          const number = content.match(/\d+/);
          if (number) {
            referenceMap.set(counter, number[0]);
            return `[${counter++}]`;
          }
          return "";
        }
      }

      if (node.nodeName === "p") {
        return "\n\n" + node.childNodes.map(processNodePlainText).join("");
      }

      if (node.nodeName === "br") {
        return "\n";
      }

      return node.childNodes
        ? node.childNodes.map(processNodePlainText).join("")
        : "";
    };

    const processNodeFormatted = (node) => {
      if (node.nodeName === "sup") {
        const content = node.childNodes.map(processNodeFormatted).join("");
        const number = content.match(/\d+/);
        if (number) {
          return `[${number[0]}]`;
        }
        return "";
      }

      if (node.childNodes) {
        node.childNodes = node.childNodes.map(processNodeFormatted);
      }

      return node;
    };

    const plainText = processNodePlainText(document)
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const formattedDocument = processNodeFormatted(document);
    const formattedHtml = serialize(formattedDocument);

    return { plainText, formattedHtml };
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText =
      e.clipboardData.getData("text/html") || e.clipboardData.getData("text");
    handleInput(pastedText);
  };

  const handleInput = (pastedText) => {
    setInput(pastedText);
    const { plainText, formattedHtml } = processClipboard(pastedText);
    setPlainTextOutput(plainText);
    setFormattedOutput(formattedHtml);
  };

  const handleCopyPlainText = () => {
    navigator.clipboard.writeText(plainTextOutput);
  };

  const handleCopyFormatted = () => {
    navigator.clipboard.writeText(formattedOutput);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Link formatter for social media
      </h1>
      <div className="mb-4">
        <label className="block mb-2">Paste your content here:</label>
        <textarea
          className="w-full h-40 p-2 border rounded"
          onPaste={handlePaste}
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Paste your content here..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Plaintext output for LinkedIn:</label>
          <textarea
            className="w-full h-40 p-2 border rounded"
            value={plainTextOutput}
            readOnly
          />
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleCopyPlainText}
          >
            Copy Plain Text
          </button>
        </div>
        <div>
          <label className="block mb-2">Formatted output for Substack:</label>
          <textarea
            className="w-full h-40 p-2 border rounded"
            value={formattedOutput}
            readOnly
          />
          <button
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleCopyFormatted}
          >
            Copy Formatted HTML
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClipboardProcessor;
