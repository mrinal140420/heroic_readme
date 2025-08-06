export async function generateWithGPT(messages) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error('OpenAI API Error:', json);
    throw new Error(json.error?.message || 'Unknown OpenAI error');
  }

  return json.choices?.[0]?.message?.content || '';
}
