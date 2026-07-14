import type Anthropic from "@anthropic-ai/sdk";

/** Concatenates all text blocks from a Claude API response into one string. */
export function extractReplyText(message: Anthropic.Message): string {
  return message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .filter(Boolean)
    .join("\n");
}
