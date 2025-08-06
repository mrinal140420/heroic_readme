import { generateWithGemini } from '../../lib/gemini';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { user, githubData, skills } = req.body;

    const bio = githubData?.user?.bio || '';
    const selectedSkills = (skills && skills.length > 0) ? skills.join(', ') : 'various programming and development technologies';
const prompt = `
You are a professional AI profile writer specialized in creating GitHub READMEs.

🎯 TASK:
Write a detailed, visually engaging **GitHub profile README** in **pure Markdown** based on the user's real GitHub data.

👤 USER DATA:
- GitHub username: "${user}"
- GitHub bio: "${bio}"
- Selected skills: ${selectedSkills}

🛑 STRICT RULES:
- Do **not** invent fake achievements, companies, or projects.
- Only use the information provided.
- If data for a section is missing, you may:
  - Use a clearly marked placeholder (like [add your blog link here])
  - Or skip that section entirely

📚 STYLE GUIDE:
- Write in a friendly, developer-oriented tone
- Make the “About Me” section **at least 3–4 sentences long**
- Expand on interests, passions, values, and what excites the user as a developer (based on the GitHub bio)
- Use relevant emojis in section titles (but keep it tasteful)
- Use clean Markdown, no extra code blocks, no explanations

📐 STRUCTURE (follow this order):
1. 👋 Introduction — include name and a friendly opener
2. 🧠 About Me — detailed, paragraph format based on GitHub bio
3. 🔧 Skills — show skills using badge-style icons or Markdown list
4. 📊 GitHub Stats — embed stats with GitHub username
5. 🏆 Achievements — optional; use placeholder or omit if unknown
6. 📜 Certifications — optional; use placeholder or omit if unknown
7. 🧩 Open Source — mention GitHub activity or placeholder
8. 🏅 Developer Badges — Holopin-style badge section (placeholder allowed)
9. ✍️ Blog Posts — use placeholder links
10. 📚 Currently Learning — infer based on selected skills (or skip)
11. 🎮 Fun Facts / Hobbies — optional but make it feel real
12. 📫 Contact — LinkedIn, Gmail with placeholders

⚠️ FINAL INSTRUCTION:
Output **only the final Markdown content**. No comments. No code blocks. No headings outside of Markdown. Just the Markdown profile content.
`;


    const markdown = await generateWithGemini(prompt);

    if (!markdown) {
      throw new Error('Gemini returned empty content');
    }

    res.status(200).json({ markdown });
  } catch (err) {
    console.error('Gemini generation failed:', err);
    res.status(500).json({ error: 'Gemini generation failed' });
  }
}
