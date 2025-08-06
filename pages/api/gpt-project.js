// pages/api/gpt-project.js

import { generateWithGemini } from '../../lib/gemini';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { user, repo } = req.body;

  if (!user || !repo || !repo.name) {
    return res.status(400).json({ error: 'Missing required repo or user information' });
  }

  const prompt = generateStructuredPrompt(user, repo);

  try {
    const markdown = await generateWithGemini(prompt);
    res.status(200).json({ markdown });
  } catch (error) {
    console.error('README generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate README using Gemini' });
  }
}

function generateStructuredPrompt(user, repo) {
  return `
📘 TASK:
Generate a clean, professional, and well-formatted GitHub README.md for the following project based on this data.

📂 REPO INFO:
- Repository: ${repo.name}
- Owner: ${user}
- Description: ${repo.description || 'No description provided'}
- Primary Language: ${repo.language || 'Not specified'}
- Topics: ${repo.topics?.join(', ') || 'None'}
- Stars: ${repo.stargazers_count}
- Forks: ${repo.forks_count}
- License: ${repo.license?.name || 'Not specified'}
- Homepage: ${repo.homepage || 'None'}

🎯 OBJECTIVE:
Produce a README in **Markdown** that includes the following sections (exact format):

# 🚀 Project Title

## ✨ Tagline (1 line summary)

## 📖 Description

## 🔥 Features

## 🛠️ Tech Stack

## 📦 Installation

## ▶️ Usage

## 🤝 Contributing

## 🧪 Testing

## 🪪 License

## 🧠 Acknowledgements

## 📞 Contact

🎨 ADDITIONAL INSTRUCTIONS:
- Format the output using proper **Markdown** syntax.
- Use emojis for headings as shown above.
- If data is missing, make smart developer-friendly guesses.
- Avoid unnecessary fluff, focus on clarity and usefulness.
- Add Shields.io badges for Stars, Forks, and License.
- Output only the raw markdown content — no explanation, no preamble.
- Output **only** the final **Markdown content**.
- Do not explain, summarize, or introduce the output.
- No headings like "Here is your README", no extra commentary.
- Just return the full markdown content.

`;
}
