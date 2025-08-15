// netlify/functions/airtable-contact.js
// Writes form submissions to Airtable using a Personal Access Token (PAT).

const AIRTABLE_TOKEN     = process.env.AIRTABLE_TOKEN;      // e.g. patXXXXXXXX
const AIRTABLE_BASE_ID   = process.env.AIRTABLE_BASE_ID;    // appXXXXXXXXXXXXXX
const AIRTABLE_TABLE_NAME= process.env.AIRTABLE_TABLE_NAME; // e.g. "Leads" or "Contacts"

const API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: 'Method Not Allowed'
    };
  }

  try {
    const { name, email, phone, message } = JSON.parse(event.body || '{}');

    // Basic validation
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: 'Missing required fields: name, email, message'
      };
    }

    // Map to Airtable fields (ensure these EXACT field names exist in your table)
    const airtablePayload = {
      records: [
        {
          fields: {
            Name: name,
            Email: email,
            Phone: phone || '',
            Message: message,
            Source: 'Website Contact Form', // optional convenience field
            SubmittedAt: new Date().toISOString() // create a Date field if you want this
          }
        }
      ]
    };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(airtablePayload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Airtable error:', text);
      return {
        statusCode: res.status,
        headers: corsHeaders(),
        body: text
      };
    }

    const data = await res.json();
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify({ ok: true, id: data.records?.[0]?.id })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: 'Server Error'
    };
  }
};

function corsHeaders () {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}
