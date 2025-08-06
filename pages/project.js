import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import MarkdownPreview from '../components/MarkdownPreview';

export default function ProjectReadmePage() {
  const router = useRouter();
  const { user } = router.query;
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingRepos(true);
      fetch(`/api/github?user=${user}`)
        .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch repos')))
        .then((data) => setRepos(data.repos || []))
        .catch((err) => setError('Failed to fetch GitHub repositories.'))
        .finally(() => setLoadingRepos(false));
    }
  }, [user]);

  const generateProjectReadme = async () => {
    if (!selectedRepo) return;
    setError('');
    setReadme('');
    setLoading(true);
    try {
      const repoData = repos.find(r => r.name === selectedRepo);
      const res = await fetch('/api/gpt-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, repo: repoData }),
      });
      const data = await res.json();
      if (!res.ok || !data.markdown) {
        throw new Error(data.error || 'Gemini failed to generate README');
      }
      setReadme(data.markdown);
    } catch (err) {
      console.error(err);
      setError('Gemini failed to generate a README. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!readme) return;
    await navigator.clipboard.writeText(readme);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (ext = 'md') => {
    if (!readme) return;
    const blob = new Blob([readme], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `README.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-wrapper">
      <div className="card container">
        <h1 className="section-title">📁 Project README Generator</h1>

        {error && <ErrorAlert message={error} />}
        {loadingRepos && <LoadingSpinner label="Fetching repositories..." />}

        {!loadingRepos && (
          <div className="form-group">
            <label className="form-label">Select a repository</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select
                className="input"
                onChange={(e) => setSelectedRepo(e.target.value)}
                value={selectedRepo}
                disabled={loading}
                style={{ flexGrow: 1 }}
              >
                <option value="">-- Choose a repo --</option>
                {repos.map((repo) => (
                  <option key={repo.name} value={repo.name}>{repo.name}</option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={generateProjectReadme}
                disabled={loading || !selectedRepo}
              >
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        )}

        {loading && !loadingRepos && <LoadingSpinner label="Generating README..." />}

        {readme && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={handleCopy} className="btn btn-secondary">{copied ? '✅ Copied!' : '📋 Copy'}</button>
                <button onClick={() => handleDownload('md')} className="btn btn-secondary">⬇️ Download .md</button>
            </div>
            <h2 style={{textAlign: 'center', fontSize: '1.5rem', margin: '2rem 0 1rem'}}>📄 Preview</h2>
            <div className="markdown-preview"><MarkdownPreview content={readme} /></div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
