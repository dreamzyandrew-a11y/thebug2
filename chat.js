exports.handler = async function (event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Not allowed" };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: "Bad request" }) }; }

  const { messages, system } = body;
  if (!messages || !system) return { statusCode: 400, body: JSON.stringify({ error: "Missing data" }) };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system, messages }),
    });

    const data = await res.json();
    if (data.error) return { statusCode: 500, body: JSON.stringify({ error: data.error.message }) };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: data.content?.[0]?.text || "" }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
