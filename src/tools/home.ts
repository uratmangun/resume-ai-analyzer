import { type ToolMetadata } from "xmcp";

// openAI widget metadata
const widgetMeta = {
  "openai/outputTemplate": "ui://widget/home.html", // this points to your resource
  "openai/toolInvocation/invoking": "Get homepage url", // this is the text that will be displayed when the tool is invoked
  "openai/toolInvocation/invoked": "get a homepage", // this is the text that will be displayed when the tool is invoked
  "openai/widgetAccessible": true,
  "openai/widgetPrefersBorder": true,
  "openai/resultCanProduceWidget": true, // this is the text that will be displayed when the tool is invoked
}; // this is the metadata for the widget

// tool metadata
export const metadata: ToolMetadata = {
  name: "get-home",
  description: "Show Homepage URL",
  annotations: {
    title: "Homepage URL",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
  },
  _meta: {
    ...widgetMeta,
  },
};

export default async function handler() {
  return {
    // returning content is optional, but you can return it if you want
    /* content: [
      {
        type: "text",
        text: "Rendered a pizza album!",
      },
    ], */
    _meta: widgetMeta, // mandatory: make sure to return metadata here as well
  };
}
