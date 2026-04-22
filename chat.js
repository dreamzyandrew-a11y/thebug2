exports.handler = async function (event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Not allowed" };
  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: "Bad request" }) }; }
  const { messages, system } = body;
  if (!messages || !system) return { statusCode: 400, body: JSON.stringify({ error: "Missing data" }) };
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1200,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    const data = await res.json();
    if (data.error) return { statusCode: 500, body: JSON.stringify({ error: data.error.message }) };
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: data.choices?.[0]?.message?.content || "" }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
