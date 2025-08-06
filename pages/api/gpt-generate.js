import { generateWithGPT } from '../../lib/openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'No messages provided' });
  }

  try {
    const markdown = await generateWithGPT(messages);
    res.status(200).json({ markdown });
  } catch (err) {
    console.error('GPT generation error:', err);
    res.status(500).json({ error: 'Failed to generate with GPT' });
  }
}
