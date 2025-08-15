// netlify/functions/createLead.js
const getFetch = async () => {
  // Use global fetch if available (Node 18+), else fall back to node-fetch
  if (typeof fetch === 'function') return fetch;
  const nf = await import('node-fetch');
  return nf.default;
};

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Parse JSON body
    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return { statusCode: 400, body: 'Invalid JSON body' };
    }

    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return { statusCode: 400, body: 'Missing required fields: name, email, message' };
    }

    // Env vars
    const apiKey = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const table  = process.env.AIRTABLE_TABLE_NAME || 'Leads';

    if (!apiKey || !baseId || !table) {
      return {
        statusCode: 500,
        body: `Server config error: missing ${
          !apiKey ? 'AIRTABLE_TOKEN ' : ''
        }${!baseId ? 'AIRTABLE_BASE_ID ' : ''}${
          !table ? 'AIRTABLE_TABLE_NAME ' : ''
        }`.trim()
      };
    }

    const _fetch = await getFetch();
    const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}`;

    // IMPORTANT: Column names must match your Airtable exactly
    const airtablePayload = {
      records: [
        {
          fields: {
            Name: name,           // text column: "Name"
            Email: email,         // text column: "Email"
            Phone: phone || '',   // text column: "Phone" (optional)
            Message: message,     // long text column: "Message"
            Source: 'Website Contact',
            SubmittedAt: new Date().toISOString()
          }
        }
      ]
    };

    const res = await _fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(airtablePayload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Return Airtable error payload so you can see it in the alert
      return {
        statusCode: res.status,
        body: typeof data === 'string' ? data : JSON.stringify(data)
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, id: data.records?.[0]?.id || null })
    };
  } catch (err) {
    // Last-resort crash guard with message
    return { statusCode: 500, body: `Server error: ${err.message}` };
  }
};
