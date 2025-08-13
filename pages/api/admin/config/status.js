import {SERVER_URL, ADMIN_PANEL_TOKEN, CLIENT_URL} from '../../../../lib/clientConfig';

export default async function handler(_req, res) {
  const base = SERVER_URL;
  try {
    const r = await fetch(`${base}/config/configStatus`, {
      headers: {
        'x-admin-token': ADMIN_PANEL_TOKEN || '',
        'origin': CLIENT_URL || '',
      },
    });
    const text = await r.text();
    return res.status(r.status).send(text);
  } catch (e) {
    return res.status(500).json({error: e.message || 'Proxy failed'});
  }
}
