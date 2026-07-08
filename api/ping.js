export const config = { maxDuration: 5 };

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ ok: true, ts: Date.now() });
}
