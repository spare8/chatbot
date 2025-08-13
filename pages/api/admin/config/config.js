import {SERVER_URL, ADMIN_PANEL_TOKEN, CLIENT_URL} from '../../../../lib/clientConfig';

export default async function handler(req, res) {
  const base = SERVER_URL;
  const url = `${base}/config/${req.method === 'POST' ? 'updateConfig' : 'getConfig'}`;

  const r = await fetch(url, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_PANEL_TOKEN || '',
      'origin': CLIENT_URL || '',
    },
    body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
  });

  const text = await r.text();
  res.status(r.status).send(text);
}
