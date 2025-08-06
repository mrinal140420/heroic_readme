import { useState } from 'react';

export default function GPTAssistant({ label, systemPrompt, onGenerate }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const generateContent = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/gpt-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input },
          ],
        }),
      });

      const data = await res.json();
      onGenerate(data.markdown || '');
    } catch (err) {
      console.error('GPT error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <label className="block font-medium mb-1">{label}</label>
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows="4"
        placeholder="Describe what you want..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={generateContent}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Generating...' : 'Ask AI'}
      </button>
    </div>
  );
}
