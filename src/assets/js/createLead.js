// netlify/functions/createLead.js
export async function handler(event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, phone, message } = JSON.parse(event.body || '{}');

    if (!name || !email || !message) {
      return { statusCode: 400, body: 'Missing required fields: name, email, message' };
    }

    const apiKey   = process.env.AIRTABLE_TOKEN;
    const baseId   = process.env.AIRTABLE_BASE_ID;
    const table    = process.env.AIRTABLE_TABLE_NAME || 'Leads';

    // Airtable REST API endpoint
    const url = `https://api.airtable.com/v0/${encodeURIComponent(baseId)}/${encodeURIComponent(table)}`;

    // Map your fields to Airtable column names exactly
    const airtablePayload = {
      records: [
        {
          fields: {
            Name: name,                // <-- make sure your Airtable has "Name"
            Email: email,              // <-- "Email"
            Phone: phone || '',        // <-- "Phone" (optional)
            Message: message,          // <-- "Message"
            Source: 'Website Contact', // optional helper column
            SubmittedAt: new Date().toISOString() // optional helper column
          }
        }
      ]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(airtablePayload)
    });

    const data = await res.json();

    if (!res.ok) {
      // Surface Airtable errors for easier debugging
      return { statusCode: res.status, body: JSON.stringify(data) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, id: data.records?.[0]?.id }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
}
