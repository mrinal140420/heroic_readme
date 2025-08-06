import { useState, useEffect } from 'react';
import MarkdownPreview from './MarkdownPreview';
import LoadingSpinner from './LoadingSpinner';

export default function ProjectForm({ username }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);

  // 🔄 Fetch GitHub repos when username is available
  useEffect(() => {
    const fetchRepos = async () => {
      if (!username) return;
      try {
        const res = await fetch(`/api/github?user=${username}`);
        const data = await res.json();
        setRepos(data.repos || []);
      } catch (err) {
        console.error('Failed to fetch repos:', err);
      }
    };

    fetchRepos();
  }, [username]);

  const handleGenerate = async () => {
    setLoading(true);
    const res = await fetch('/api/gpt-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl, description }),
    });
    const data = await res.json();
    setMarkdown(data.markdown || 'Error generating README.');
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 Generate Project README</h1>

      <label className="block mb-2">📁 Select Repository</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
      >
        <option value="">-- Choose a repo --</option>
        {repos.map((repo) => (
          <option key={repo.name} value={repo.html_url}>
            {repo.name}
          </option>
        ))}
      </select>

      <label className="block mb-2">📝 Project Description (optional)</label>
      <textarea
        rows={4}
        placeholder="Briefly describe the project..."
        className="w-full p-2 border rounded mb-4"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        disabled={loading || !repoUrl}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {loading ? 'Generating...' : 'Generate README'}
      </button>

      {loading && <LoadingSpinner />}
      {markdown && <MarkdownPreview content={markdown} />}
    </div>
  );
}
