export default async function handler(req, res) {
    // Allow CORS from same origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { emailContent, tone, length, language } = req.body;

    if (!emailContent) {
        return res.status(400).json({ error: 'Email content is required' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'API key not configured on server' });
    }

    const prompt = `You are a professional email assistant. Write a ${length} email reply in ${language} with a ${tone} tone to the following email:\n\n${emailContent}\n\nDo NOT include conversational filler, just output the reply directly.`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({ error: err.error?.message || 'API error' });
        }

        const data = await response.json();
        const reply = data.choices[0].message.content.trim();
        return res.status(200).json({ reply });

    } catch (error) {
        return res.status(500).json({ error: 'Failed to generate reply. Please try again.' });
    }
}
