// Arbitrary URL forwarding is retired. Solo uses procedural sound effects.
// Reviewed/licensed voice assets belong to a later release.
export default function handler(_request, response) {
  response.setHeader("Cache-Control", "no-store");
  return response.status(410).json({ error: "Hero audio is not available in this edition." });
}
