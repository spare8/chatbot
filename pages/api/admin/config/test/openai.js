import {SERVER_URL, CLIENT_URL, ADMIN_PANEL_TOKEN} from '../../../../../lib/clientConfig';

export default async function handler(req, res) {
  const base = SERVER_URL;
  const origin = CLIENT_URL;
  const token = ADMIN_PANEL_TOKEN;

  const r = await fetch(`${base}/config/test/openai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
      // middleware signals
      'referer': `${origin}/_next_api`,
      'x-internal-proxy': 'next',
    },
    body: JSON.stringify(req.body || {}),
  });
  const text = await r.text();
  res.status(r.status).send(text);
}
