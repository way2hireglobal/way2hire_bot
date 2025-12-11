// netlify/functions/dialogflow.js
const {SessionsClient} = require('@google-cloud/dialogflow');
const uuid = require('uuid');

exports.handler = async function(event, context) {
  try {
    // Security: optional header secret (set API_SECRET in Netlify env)
    const API_SECRET = process.env.API_SECRET;
    if (API_SECRET) {
      const incoming = (event.headers && (event.headers['x-api-secret'] || event.headers['X-Api-Secret'])) || '';
      if (incoming !== API_SECRET) {
        return { statusCode: 401, body: 'Unauthorized' };
      }
    }

    // Parse body
    const body = event.body ? JSON.parse(event.body) : {};

    // Distinguish between a Dialogflow webhook (sent by DF to your URL) and client proxy calls.
    // Dialogflow webhook will include "queryResult" or "originalDetectIntentRequest".
    if (body && (body.queryResult || body.originalDetectIntentRequest)) {
      // Simple webhook fulfillment: echo or respond based on intent
      const intentName = body.queryResult?.intent?.displayName || 'unknown';
      let fulfillmentText = "Thanks — I'll handle that shortly.";

      // Example: custom responses for specific intents:
      if (intentName === 'AboutUs') {
        fulfillmentText = "Way2Hire is an AI-powered recruitment and staffing platform that helps companies find qualified talent faster.";
      } else if (intentName === 'ContactUs') {
        fulfillmentText = "You can contact way@hire at way2hireglobal@gmail.com or visit our website.";
      } else {
        // fallback: use the existing DF fulfillmentText if present
        fulfillmentText = body.queryResult?.fulfillmentText || fulfillmentText;
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ fulfillmentText })
      };
    }

    // Otherwise treat as a client request to detectIntent
    const projectId = process.env.DIALOGFLOW_PROJECT_ID;
    const clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL;
    let privateKey = process.env.DIALOGFLOW_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server not configured. Set DIALOGFLOW_PROJECT_ID, DIALOGFLOW_CLIENT_EMAIL and DIALOGFLOW_PRIVATE_KEY.' })
      };
    }

    // Private key might be stored with escaped newlines. Replace literal "\n" with actual newlines.
    if (privateKey.includes('\\n')) privateKey = privateKey.replace(/\\n/g, '\n');

    const client = new SessionsClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey
      }
    });

    const sessionId = body.sessionId || uuid.v4();
    const sessionPath = client.projectAgentSessionPath(projectId, sessionId);

    // text query
    if (!body.text) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing text in request body.' }) };
    }

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: body.text,
          languageCode: 'en-US'
        }
      }
    };

    const responses = await client.detectIntent(request);
    const result = responses[0].queryResult;

    return {
      statusCode: 200,
      body: JSON.stringify({
        text: result.fulfillmentText || '',
        intent: result.intent?.displayName || null,
        parameters: result.parameters || {}
      })
    };

  } catch (err) {
    console.error('Error in function', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
