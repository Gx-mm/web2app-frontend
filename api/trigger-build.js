export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { build_id, app_name, app_id, web_url, icon_url } = req.body;

  const GITHUB_OWNER = (process.env.GITHUB_OWNER || '').trim();
  const GITHUB_REPO = (process.env.GITHUB_REPO || '').trim();
  const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || '').trim();
  const WORKFLOW_FILE = 'build-apk.yml';

  const targetUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          build_id: String(build_id),
          app_name: String(app_name),
          app_id: String(app_id),
          web_url: String(web_url),
          icon_url: String(icon_url),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Failed URL: ${targetUrl} | TokenLen: ${GITHUB_TOKEN.length} | GitHub: ${errorText}`
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
