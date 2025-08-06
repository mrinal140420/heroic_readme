// pages/api/github.js

export default async function handler(req, res) {
  const rawUsername = req.query.username || req.query.user;
  const username = rawUsername?.trim();

  if (!username) {
    return res.status(400).json({ error: 'Missing GitHub username' });
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos`);
    
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const repos = await response.json();

    res.status(200).json({ repos }); // ✅ wrap for frontend
  } catch (error) {
    console.error('GitHub fetch error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to fetch GitHub repos' });
  }
}
