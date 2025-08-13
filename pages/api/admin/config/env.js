import {SERVER_URL, ADMIN_PANEL_TOKEN, CLIENT_URL} from '../../../../lib/clientConfig';

export default async function handler(req, res) {
  const base = SERVER_URL;
  const commonHeaders = {
    'x-admin-token': ADMIN_PANEL_TOKEN || '',
    'origin': CLIENT_URL || '',
  };

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${base}/config/getConfig`, {headers: commonHeaders});
      const text = await r.text();
      return res.status(r.status).send(text);
    }

    if (req.method === 'POST') {
      const r = await fetch(`${base}/config/updateConfig`, {
        method: 'POST',
        headers: {...commonHeaders, 'Content-Type': 'application/json'},
        body: JSON.stringify(req.body || {}),
      });
      const text = await r.text();
      return res.status(r.status).send(text);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end('Method Not Allowed');
  } catch (e) {
    return res.status(500).json({error: e.message || 'Proxy failed'});
  }
}
