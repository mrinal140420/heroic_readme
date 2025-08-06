import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';

export default function Home() {
  const [githubId, setGithubId] = useState('');
  const router = useRouter();

  const handleGenerate = (type) => {
    if (!githubId.trim()) return alert('Please enter a GitHub username');
    router.push(`/${type}?user=${githubId}`);
  };

  return (
    <div className="container section" style={{ textAlign: 'center' }}>
      <motion.h1
       style={{ fontSize: '5rem' }}
        className="text-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Heroic Readme 🦸‍♂️
      </motion.h1>

      <motion.p
       style={{ fontSize: '3rem' }}
        className="text-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Typewriter
          words={[
            'Generate stunning GitHub Profile READMEs...',
            'Generate beautiful Project READMEs...',
            'Powered by AI and your GitHub data 🚀',
          ]}
          loop
          cursor
          cursorStyle="_"
          typeSpeed={60}
          deleteSpeed={40}
          delaySpeed={1600}
          
        />
      </motion.p>

      <motion.input
        type="text"
        value={githubId}
        onChange={(e) => setGithubId(e.target.value)}
        placeholder="Enter your GitHub username"
        className="input"
        style={{
          maxWidth: '400px',
          margin: '1rem auto',
          display: 'block',
          textAlign: 'center',
          fontSize: '1.125rem',
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7 }}
      />

      <motion.div
        className="btn-group"
        style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <button className="btn btn-primary" onClick={() => handleGenerate('profile')}>
          Profile README
        </button>
        <button className="btn btn-secondary" onClick={() => handleGenerate('project')}>
          Project README
        </button>
      </motion.div>
    </div>
  );
}
