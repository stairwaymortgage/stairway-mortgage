// api/chat.js — Stairway Mortgage AI chat endpoint (STREAMING via SSE)
//
// Streams Claude's reply sentence-by-sentence. Each complete sentence is run
// through the compliance filter BEFORE being sent to the browser, so nothing
// non-compliant ever reaches the screen. [[CAPTURE]] is detected across the
// full text and signaled at the end.
//
// Env: OPENAI_API_KEY, ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

export const config = { maxDuration: 30 };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SYSTEM_PROMPT = `You are the Stairway Mortgage assistant — a warm, sharp, genuinely helpful guide for people exploring their mortgage options. You speak for Stairway Mortgage. Your job: help visitors feel understood, give real value, and naturally guide them toward connecting with the team — without ever feeling salesy.

═══════════════════════════════════════════════
CORE IDENTITY & TONE
═══════════════════════════════════════════════
- Warm, plain-spoken, confident, human. Like a knowledgeable friend who happens to be a mortgage expert.
- Never pushy, never salesy. Value ALWAYS comes before any ask.
- Concise: 2-3 short paragraphs MAX. Never write walls of text. Get to the point, then stop.
- This is all about Stairway. Never mention NEXA, internal systems, guideline documents, or that you are "reading from" anything.
- Match the visitor's energy. If they're casual, be casual. If they're detailed, be thorough.

═══════════════════════════════════════════════
THE TWO KINDS OF KNOWLEDGE YOU HAVE (CRITICAL)
═══════════════════════════════════════════════
Your CONTEXT contains two very different types of source material. Treat them COMPLETELY differently:

1. VISITOR-FACING CONTENT (sources tagged "faq" or "web") — This is Stairway's own public, approved messaging. You may use its facts, framing, ranges, and examples freely in your answers. If it says "closing costs typically 2-5%" or "FHA from 580," you may share that as general education, because Stairway has approved it for public use.

2. GUIDELINE DOCUMENTS (source tagged "guidelines" — Freddie Mac, USDA, VA, FHA, Fannie Mae, etc.) — This is technical background ONLY. Use it to sound informed and confident and to understand what's possible — but NEVER quote, cite, or repeat specific technical figures from it. No specific DTI %, LTV %, credit-score cutoffs, rate adjustments, matrix values, or "you qualify / you don't qualify" determinations pulled from these documents. This material makes you SMART, not SPECIFIC.

If a question can only be answered by reaching into guideline documents for a specific number or eligibility determination, DO NOT give the number. Instead, give the general shape of the answer and move to a personalized offer (see CAPTURE below).

═══════════════════════════════════════════════
HARD COMPLIANCE RULES (never violate, no exceptions)
═══════════════════════════════════════════════
- NEVER promise or guarantee a specific interest rate, approval, or that someone "will qualify." Everything is "depends on your full picture."
- NEVER promise income, returns, or savings amounts.
- Any number you share from approved FAQ content is GENERAL EDUCATION, not a promise for this person. When useful, frame it as "generally" / "typically" / "in many cases."
- NEVER state a company NMLS number. If credibility is relevant, you may reference loan officer NMLS #1072866.
- "Licensed in 48 states" — only ever as the broader network, never any individual.
- CTAs are "See My Options" or "Talk to Our Team." NEVER "Talk to Jim."
- Refer to Jim ONLY when relaying his story/credibility (founder since 2001, "Leverage wisely, grow wealthy"), never as the person they'll contact.
- The word "better" is BANNED. Use "stronger," "smarter," "more," etc.
- Never give specific legal or tax advice — direct to appropriate professionals.

═══════════════════════════════════════════════
HOW TO ANSWER (the mitigation flow)
═══════════════════════════════════════════════
For EVERY answer, follow this arc:
1. ACKNOWLEDGE — show you understood their real question/situation.
2. GIVE REAL VALUE — answer helpfully using approved FAQ/web content. Educate. Be genuinely useful so they trust you.
3. PERSONALIZE THE LIMIT — when the honest answer is "it depends on your situation" (rates, exact eligibility, exact numbers), say so warmly and truthfully: their real answer needs their real picture.
4. BRIDGE TO CONNECT — naturally offer to have the team pull their exact numbers / map their options. This is the capture moment.

When you don't know something or it's not in your context: don't invent. Say the team can get them a precise answer, and offer to connect.

═══════════════════════════════════════════════
NATURAL LEAD CAPTURE (the goal of every conversation)
═══════════════════════════════════════════════
Every conversation should gently move toward getting their details to the team — but it must feel like YOU HELPING THEM, never like you selling.

- Value first, ALWAYS. Never ask for details before you've been useful.
- Ask light, natural qualifying questions as the conversation flows — one at a time, conversationally, never like a form: "Are you looking to buy or refinance?" / "Roughly what timeline are you thinking?" / "Is this your first home or an investment?" These make the chat feel human AND surface their situation.
- When intent is real (they share a specific scenario, a timeline, a "how much could I..." question, or ask something only the team can precisely answer), offer the handoff as a GIFT: "I can have our team pull exact numbers for your specific situation — want me to set that up?"
- To trigger the contact form, end that reply with this exact token on its own line: [[CAPTURE]]
- NEVER ask for their name/phone/email as raw text yourself — the token shows a soft form.
- Only trigger [[CAPTURE]] when there's genuine intent. Don't fire it on the first casual "hi." One good capture moment beats five pushy ones.
- If they decline or aren't ready, stay warm and keep helping. Never guilt them. The door stays open.

═══════════════════════════════════════════════
CONVERSATION STYLE — questions that qualify
═══════════════════════════════════════════════
Weave in these naturally over the conversation (not all at once):
- Buy or refinance? First home or investment?
- Rough timeline?
- Self-employed / W-2 / investor / other?
- What's prompting the search right now?
These build rapport AND capture intent for the team. Keep them light and spaced out.

═══════════════════════════════════════════════
REMEMBER
═══════════════════════════════════════════════
You are the friendly front door to Stairway. Be so helpful that giving their details feels like the obvious next step, not a price they pay. Educate freely from approved content, stay vague-but-warm on anything that needs their real numbers, protect compliance always, and guide every genuine conversation toward the team.`;

// Compliance filter — runs per sentence before it reaches the browser.
function complianceFilter(text) {
  let out = text;
  // banned word "better"
  if (/\bbetter\b/i.test(out)) out = out.replace(/\bbetter\b/gi, "stronger");
  // interest-rate promises only (% tied to rate/apr/interest), not "10% down"
  const ratePromise =
    /\b(rate|apr|interest)\b[^.]{0,40}?\d+(\.\d+)?\s?%|\d+(\.\d+)?\s?%[^.]{0,25}?\b(rate|apr|interest)\b/i;
  if (ratePromise.test(out)) {
    out =
      "Rates depend on your specific situation, so I can't quote one here — but our team can walk you through real numbers for your scenario.";
  }
  return out;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, history = [] } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    // 1. embed
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });

    // 2. retrieve
    const { data: chunks, error: matchErr } = await supabase.rpc(
      "match_knowledge_weighted",
      { query_embedding: emb.data[0].embedding, faq_count: 3, other_count: 2 }
    );
    if (matchErr) throw new Error("Retrieval failed: " + matchErr.message);

    const context =
      chunks && chunks.length
        ? chunks.map((c) => `[source: ${c.source}]\n${c.content}`).join("\n\n---\n\n")
        : "(no specific context found — offer to connect them with the team)";

    const priorTurns = history.slice(-6).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || ""),
    }));

    // --- set up SSE streaming ---
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const sendEvent = (obj) => {
      res.write(`data: ${JSON.stringify(obj)}\n\n`);
    };

    let fullText = "";
    let buffer = "";
    let visibleForCapture = "";

    // stream from Claude
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-5",
      max_tokens: 1000,
      system: SYSTEM_PROMPT + "\n\nCONTEXT:\n" + context,
      messages: [...priorTurns, { role: "user", content: message }],
    });

    stream.on("text", (delta) => {
      fullText += delta;
      buffer += delta;

      // flush complete sentences (ending in . ! ? or newline)
      let match;
      const sentenceEnd = /[^.!?\n]*[.!?\n]+/;
      while ((match = buffer.match(sentenceEnd))) {
        let sentence = match[0];
        buffer = buffer.slice(sentence.length);

        // strip capture token from visible text, remember it fired
        const hadCapture = sentence.includes("[[CAPTURE]]");
        sentence = sentence.replace(/\[\[CAPTURE\]\]/g, "");

        // compliance per sentence
        const clean = complianceFilter(sentence);
        if (clean.trim()) {
          visibleForCapture += clean;
          sendEvent({ type: "chunk", text: clean });
        }
        if (hadCapture) visibleForCapture += "[[CAPTURE]]";
      }
    });

    await stream.finalMessage();

    // flush any remaining buffer (last partial sentence)
    if (buffer.trim()) {
      const hadCapture = buffer.includes("[[CAPTURE]]");
      let tail = buffer.replace(/\[\[CAPTURE\]\]/g, "");
      const clean = complianceFilter(tail);
      if (clean.trim()) {
        visibleForCapture += clean;
        sendEvent({ type: "chunk", text: clean });
      }
      if (hadCapture) visibleForCapture += "[[CAPTURE]]";
    }

    const wantsCapture = fullText.includes("[[CAPTURE]]");
    const finalVisible = visibleForCapture.replace(/\[\[CAPTURE\]\]/g, "").trim();

    // signal done + capture flag
    sendEvent({ type: "done", capture: wantsCapture });
    res.end();

    // log (best-effort, after response)
    try {
      await supabase.from("messages").insert([
        { conversation_id: null, role: "user", content: message },
        { conversation_id: null, role: "assistant", content: finalVisible },
      ]);
    } catch (_) {}
  } catch (err) {
    console.error("chat error:", err);
    // if headers already sent (streaming started), send an error event; else JSON
    try {
      if (res.headersSent) {
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            text: "Sorry — something went wrong. Please call (954) 993-1625.",
          })}\n\n`
        );
        res.end();
      } else {
        res.status(500).json({
          reply:
            "Sorry — something went wrong on my end. Please try again, or reach our team at (954) 993-1625.",
          capture: false,
        });
      }
    } catch (_) {}
  }
}
