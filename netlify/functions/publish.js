exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  try {
    const TARGET_SITE_ID = process.env.NETLIFY_TARGET_SITE_ID;
    const TOKEN = process.env.NETLIFY_AUTH_TOKEN;
    if (!TARGET_SITE_ID || !TOKEN) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing ENV Variables" }) };
    }
    const { fileName, fileContentBase64 } = JSON.parse(event.body);
    const buffer = Buffer.from(fileContentBase64, "base64");

    const res = await fetch(`https://api.netlify.com/api/v1/sites/${TARGET_SITE_ID}/files/${fileName}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/octet-stream"
      },
      body: buffer
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
