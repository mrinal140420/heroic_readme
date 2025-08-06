import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import SkillSelector from '../components/SkillSelector';
import MarkdownPreview from '../components/MarkdownPreview';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { motion } from 'framer-motion';

export default function ProfileReadmePage() {
  const router = useRouter();
  const { user } = router.query;
  const [githubData, setGithubData] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [readmeMarkdown, setReadmeMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/github?user=${user}`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch data')))
      .then(data => {
        setGithubData(data);
        setError('');
      })
      .catch(() => setError('❌ Failed to fetch GitHub data.'))
      .finally(() => setLoading(false));
  }, [user]);

  const generateReadme = async () => {
    if (!githubData || loading) return;
    setLoading(true);
    setError('');
    setHasGenerated(false);
    setReadmeMarkdown('');
    try {
      const res = await fetch('/api/gpt-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, githubData, skills: selectedSkills }),
      });
      const data = await res.json();
      if (!res.ok || !data.markdown) {
        throw new Error(data.error || 'Gemini failed to generate README');
      }
      setReadmeMarkdown(data.markdown.trim());
      setHasGenerated(true);
    } catch (err) {
      console.error(err);
      setError('❌ Gemini failed to generate profile README. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopy = async () => {
    if (!readmeMarkdown) return;
    try {
      await navigator.clipboard.writeText(readmeMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Copy failed. Try manually.');
    }
  };

  const handleDownload = (ext = 'md') => {
    if (!readmeMarkdown) return;
    const blob = new Blob([readmeMarkdown], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `README.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return <div className="page-wrapper"><h1 className="section-title">Please provide a GitHub user.</h1></div>;
  }

  return (
    <div className="page-wrapper">
      <motion.div
        className="card container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="section-title">
          ✨ Profile README for @{user}
        </h1>

        {error && <ErrorAlert message={error} />}
        {!githubData && loading && <LoadingSpinner label="Fetching GitHub data..." />}

        {githubData && (
          <>
            <div className="form-group"><SkillSelector selected={selectedSkills} onChange={setSelectedSkills} /></div>
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <button className="btn btn-primary" onClick={generateReadme} disabled={loading}>
                {loading ? 'Generating...' : '🚀 Generate README'}
              </button>
            </div>
            {loading && hasGenerated && <LoadingSpinner label="Generating with Gemini..." />}
            {hasGenerated && readmeMarkdown && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <button onClick={handleCopy} className="btn btn-secondary">{copied ? '✅ Copied!' : '📋 Copy'}</button>
                  <button onClick={() => handleDownload('md')} className="btn btn-secondary">⬇️ Download .md</button>
                  <button onClick={() => handleDownload('txt')} className="btn btn-secondary">📝 Download .txt</button>
                </div>
                <h2 style={{textAlign: 'center', fontSize: '1.5rem', margin: '2rem 0 1rem'}}>📄 Preview</h2>
                <div className="markdown-preview"><MarkdownPreview content={readmeMarkdown} /></div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
