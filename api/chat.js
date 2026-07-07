// api/chat.js — Stairway Mortgage AI chat endpoint (Vercel serverless function)
//
// Flow: receive user message -> embed it (OpenAI) -> retrieve relevant chunks
// from Supabase -> ask Claude with compliance system prompt + context ->
// run a compliance safety filter on the reply -> log to Supabase -> return answer.
//
// Env vars required (set in Vercel dashboard, NEVER in code):
//   OPENAI_API_KEY, ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SYSTEM_PROMPT = `You are the Stairway Mortgage assistant. You help visitors understand their options and connect them with the team.

TONE: Warm, plain-spoken, confident. Never pushy. Value first. This is all about Stairway. Keep replies concise — a few short paragraphs at most.

HARD COMPLIANCE RULES (never violate):
- NEVER quote a specific interest rate or promise any program, term, or approval.
- NEVER promise income or returns. Any numbers are illustrative examples only, never a promise.
- Loan officer NMLS #1072866 may appear in trust/credibility context.
- NEVER state a company NMLS number in a reply.
- "Licensed in 48 states" — only ever attribute this to the broader network, never to any individual.
- CTAs are "See My Options" or "Talk to Our Team" — NEVER "Talk to Jim".
- Refer to Jim only when relaying his story or a review, never as the contact person.
- The word "better" is banned. Never use it.

ANSWERING:
- Answer ONLY from the CONTEXT below. If the context doesn't cover it, say you'll have the team get them a precise answer — don't invent specifics, programs, or numbers.

CONTACT CAPTURE (soft — only when intent is clearly high):
- Do NOT ask for contact info for general questions.
- Only when the visitor reveals real intent (their specific scenario, a timeline, a "how much could I..." question), offer to have the team pull exact numbers for their situation.
- When you do that, end your reply with this exact token on its own line: [[CAPTURE]]
- Never ask for the phone number as raw text yourself — the token triggers a soft form.`;

// Compliance safety net — runs on Claude's output before it reaches the visitor.
function complianceFilter(text) {
  let flagged = false;
  let out = text;

  // 1. banned word "better" (whole word, case-insensitive)
  if (/\bbetter\b/i.test(out)) {
    flagged = true;
    out = out.replace(/\bbetter\b/gi, "stronger");
  }

  // 2. bare rate promises like "3.5%" or "at 6.25 percent"
  const ratePattern = /\b\d+(\.\d+)?\s?%/;
  if (ratePattern.test(out)) {
    flagged = true;
    // replace the whole reply with a safe fallback for rate mentions
    out =
      "Rates depend on your specific situation, so I can't quote one here — but our team can walk you through real numbers for your scenario. Want them to reach out?\n[[CAPTURE]]";
  }

  return { text: out, flagged };
}

export default async function handler(req, res) {
  // basic CORS + method guard
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, history = [], session_id } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    // 1. embed the user's message
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });

    // 2. retrieve relevant knowledge chunks
    const { data: chunks, error: matchErr } = await supabase.rpc(
      "match_knowledge",
      { query_embedding: emb.data[0].embedding, match_count: 5 }
    );
    if (matchErr) throw new Error("Retrieval failed: " + matchErr.message);

    const context =
      chunks && chunks.length
        ? chunks.map((c) => c.content).join("\n\n---\n\n")
        : "(no specific context found — offer to connect them with the team)";

    // 3. build message history for Claude (last 6 turns max)
    const priorTurns = history.slice(-6).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    }));

    // 4. ask Claude
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 600,
      system: SYSTEM_PROMPT + "\n\nCONTEXT:\n" + context,
      messages: [...priorTurns, { role: "user", content: message }],
    });

    let reply = msg.content[0]?.text || "";

    // 5. compliance filter
    const { text: safeReply } = complianceFilter(reply);

    // 6. detect capture signal, strip token from visible text
    const wantsCapture = safeReply.includes("[[CAPTURE]]");
    const visibleReply = safeReply.replace(/\[\[CAPTURE\]\]/g, "").trim();

    // 7. log conversation (best-effort; don't block the reply if logging fails)
    try {
      await supabase.from("messages").insert([
        { conversation_id: null, role: "user", content: message },
        { conversation_id: null, role: "assistant", content: visibleReply },
      ]);
    } catch (_) {}

    return res.status(200).json({
      reply: visibleReply,
      capture: wantsCapture,
    });
  } catch (err) {
    console.error("chat error:", err);
    return res.status(500).json({
      reply:
        "Sorry — something went wrong on my end. Please try again, or reach our team at (954) 993-1625.",
      capture: false,
    });
  }
}
