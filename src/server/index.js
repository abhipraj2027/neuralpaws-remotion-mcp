import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3100;
const OUTPUT_DIR = path.join(__dirname, "../../out");
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Job tracking ──
const jobs = new Map();

// ── MCP Tool Definitions ──
const TOOLS = [
  {
    name: "render_short",
    description:
      "Render a NeuralPaws YouTube Short (1080x1920, 43s) from review data. Pass the tool name, price, score, category, key feature, warning, competitors, and verdict. Returns a job ID — poll get_status for the download URL.",
    inputSchema: {
      type: "object",
      properties: {
        toolName: { type: "string", description: "Name of the AI tool being reviewed" },
        price: { type: "string", description: "Price string, e.g. '$15/month'" },
        score: { type: "string", description: "Overall score, e.g. '4.2'" },
        category: { type: "string", description: "Category, e.g. 'AI Dictation Tool'" },
        whatText: { type: "string", description: "2-3 sentence description of what the tool does" },
        stats: {
          type: "array",
          items: {
            type: "object",
            properties: {
              value: { type: "string" },
              label: { type: "string" },
            },
          },
          description: "3 key stats, e.g. [{value:'150+',label:'WPM'}]",
        },
        featureTitle: { type: "string", description: "Name of the standout feature" },
        featureText: { type: "string", description: "1-2 sentence feature description" },
        featureIcon: { type: "string", description: "Emoji icon for the feature" },
        warningText: { type: "string", description: "The main con/warning text" },
        warningSub: { type: "string", description: "Sub-note under the warning" },
        competitors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              price: { type: "string" },
              score: { type: "string" },
              highlight: { type: "boolean" },
            },
          },
          description: "3 competitors for comparison slide",
        },
        verdictLabel: { type: "string", description: "Short verdict label, e.g. 'Best Cross-Platform'" },
        verdictText: { type: "string", description: "2-3 sentence verdict summary" },
      },
      required: ["toolName", "price", "score", "category"],
    },
  },
  {
    name: "list_templates",
    description: "List available video templates",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_status",
    description: "Check the render status of a job. Returns 'rendering', 'done' (with download URL), or 'error'.",
    inputSchema: {
      type: "object",
      properties: {
        jobId: { type: "string", description: "The job ID returned by render_short" },
      },
      required: ["jobId"],
    },
  },
];

// ── Render function ──
async function renderShort(jobId, props) {
  try {
    jobs.set(jobId, { status: "bundling", progress: 0 });

    const compositionFile = path.join(__dirname, "../compositions/root.tsx");
    const bundled = await bundle({ entryPoint: compositionFile });

    jobs.set(jobId, { status: "rendering", progress: 10 });

    const composition = await selectComposition({
      serveUrl: bundled,
      id: "ReviewShort",
      inputProps: props,
    });

    const outputPath = path.join(OUTPUT_DIR, `${jobId}.mp4`);

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: props,
      onProgress: ({ progress }) => {
        jobs.set(jobId, { status: "rendering", progress: Math.round(progress * 100) });
      },
    });

    const downloadUrl = `${PUBLIC_URL}/download/${jobId}.mp4`;
    jobs.set(jobId, { status: "done", progress: 100, downloadUrl, outputPath });
    console.log(`Job ${jobId} complete: ${downloadUrl}`);
  } catch (err) {
    console.error(`Job ${jobId} failed:`, err);
    jobs.set(jobId, { status: "error", error: err.message });
  }
}

// ── Express Server ──
const app = express();
app.use(cors());
app.use(express.json());

// Static file serving for downloads
app.use("/download", express.static(OUTPUT_DIR));

// ── MCP SSE Transport ──
app.get("/mcp", (req, res) => {
  // SSE connection for MCP
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send server info
  const serverInfo = {
    jsonrpc: "2.0",
    method: "notifications/initialized",
    params: {
      serverInfo: {
        name: "neuralpaws-remotion",
        version: "1.0.0",
      },
      capabilities: {
        tools: {},
      },
    },
  };
  res.write(`data: ${JSON.stringify(serverInfo)}\n\n`);

  // Keep alive
  const keepAlive = setInterval(() => {
    res.write(": keepalive\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAlive);
  });
});

// MCP JSON-RPC endpoint
app.post("/mcp", async (req, res) => {
  const { method, params, id } = req.body;

  if (method === "initialize") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: { name: "neuralpaws-remotion", version: "1.0.0" },
        capabilities: { tools: {} },
      },
    });
  }

  if (method === "tools/list") {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: { tools: TOOLS },
    });
  }

  if (method === "tools/call") {
    const toolName = params?.name;
    const args = params?.arguments || {};

    if (toolName === "list_templates") {
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                templates: [
                  {
                    id: "ReviewShort",
                    name: "AI Tool Review Short",
                    description: "43-second vertical video (1080x1920) with 7 animated slides: hook, what-is, feature, warning, comparison, verdict, CTA",
                    duration: "43s",
                    resolution: "1080x1920",
                    fps: 30,
                  },
                ],
              }),
            },
          ],
        },
      });
    }

    if (toolName === "render_short") {
      const jobId = uuidv4();
      // Start render in background
      renderShort(jobId, args);
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                jobId,
                status: "started",
                message: `Render job ${jobId} started. Poll get_status with this jobId for progress and download URL.`,
              }),
            },
          ],
        },
      });
    }

    if (toolName === "get_status") {
      const job = jobs.get(args.jobId);
      if (!job) {
        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify({ error: "Job not found" }) }],
          },
        });
      }
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(job) }],
        },
      });
    }

    return res.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Unknown tool: ${toolName}` },
    });
  }

  return res.json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Unknown method: ${method}` },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", jobs: jobs.size });
});

app.listen(PORT, () => {
  console.log(`NeuralPaws Remotion MCP server running on port ${PORT}`);
  console.log(`MCP endpoint: ${PUBLIC_URL}/mcp`);
  console.log(`Health: ${PUBLIC_URL}/health`);
});
