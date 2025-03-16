import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Create __dirname equivalent in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the project root (.env is two levels up)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const port = process.env.PORT || 3000;

// Allow all origins with credentials
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(bodyParser.json());

// Initialize OpenAI client (ensure your .env file has OPENAI_API_KEY)
const client = new OpenAI({
  apiKey: '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',
});

// Get assistant ID from environment (use a non-VITE name for Node)
const assistant_id = 'asst_MoKvswNCsX8UA5Y8VX4g3R9F';
if (!assistant_id) {
  console.error("Assistant ID is not set!");
}

/**
 * Utility function to format the run status response.
 */
function formatRunStatus(run, threadId) {
  return {
    run_id: String(run.id),
    thread_id: String(threadId),
    status: run.status,
    required_action: run.required_action,
    last_error: run.last_error,
  };
}

/**
 * POST /api/new
 * Creates a new thread, posts an initial hidden message, and starts a new run.
 */
app.post("/api/new", async (req, res) => {
  try {
    // Create a new thread
    const thread = await client.beta.threads.create();
    console.log("Full thread object:", JSON.stringify(thread, null, 2));

    // Extract threadId as a primitive string
    const threadId = String(thread.id);
    console.log("Extracted threadId:", threadId, "Type:", typeof threadId);
    console.log("Assistant ID:", assistant_id, "Type:", typeof assistant_id);
    if (!assistant_id) {
      throw new Error("Assistant ID is not provided.");
    }

    // Instead of including thread_id in the payload, pass threadId as the first argument.
    await client.beta.threads.messages.create(threadId, {
      content: "Greet the user and tell it about yourself and ask it what it is looking for.",
      role: "user",
      metadata: { type: "hidden" },
    });
    console.log("Message sent successfully.");

    // Create a new run by passing threadId as the first argument.
    const run = await client.beta.threads.runs.create(threadId, {
      assistant_id: assistant_id,
    });
    console.log("Run created successfully:", run);

    res.json(formatRunStatus(run, threadId));
  } catch (error) {
    console.error("Error in /api/new:", error);
    res.status(500).json({ error: error.message });
  }
});

// Other endpoints can be refactored similarly if the SDK expects the thread ID as an argument

/**
 * GET /api/threads/:thread_id/runs/:run_id
 * Retrieves the run status for the given thread and run IDs.
 */
app.get("/api/threads/:thread_id/runs/:run_id", async (req, res) => {
  try {
    const { thread_id, run_id } = req.params;
    const run = await client.beta.threads.runs.retrieve(String(thread_id), run_id);
    res.json(formatRunStatus(run, thread_id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/threads/:thread_id/runs/:run_id/tool
 * Submits tool outputs for a given thread and run.
 */
app.post("/api/threads/:thread_id/runs/:run_id/tool", async (req, res) => {
  try {
    const { thread_id, run_id } = req.params;
    const tool_outputs = req.body; // expects an array of tool output objects
    const run = await client.beta.threads.runs.submit_tool_outputs(String(thread_id), run_id, {
      tool_outputs: tool_outputs,
    });
    res.json(formatRunStatus(run, thread_id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/threads/:thread_id
 * Retrieves the list of messages in a thread.
 */
app.get("/api/threads/:thread_id", async (req, res) => {
  try {
    const { thread_id } = req.params;
    const messagesResponse = await client.beta.threads.messages.list(String(thread_id));
    const messages = messagesResponse.data.map((message) => ({
      content: message.content[0].text.value,
      role: message.role,
      hidden: message.metadata && message.metadata.type === "hidden",
      id: message.id,
      created_at: message.created_at,
    }));
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/threads/:thread_id
 * Adds a new user message to a thread and creates a new run.
 */
app.post("/api/threads/:thread_id", async (req, res) => {
  try {
    const { thread_id } = req.params;
    const { content } = req.body; // expects { content: "message text" }
    await client.beta.threads.messages.create(String(thread_id), {
      content: content,
      role: "user",
    });
    const run = await client.beta.threads.runs.create(String(thread_id), {
      assistant_id: assistant_id,
    });
    res.json(formatRunStatus(run, thread_id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
