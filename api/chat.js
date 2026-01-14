export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    try {
        const { messages, systemPrompt } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array required' });
        }
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1024,
                system: systemPrompt,
                messages: messages
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: 'API request failed', details: errorData });
        }
        const data = await response.json();
        const content = data.content.filter(block => block.type === 'text').map(block => block.text).join('\n');
        return res.status(200).json({ content });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
