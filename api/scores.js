export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const espnRes = await fetch(
            'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard',
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        const espnData = await espnRes.json();
        const events = espnData?.events || [];
        const scores = {};

        for (const event of events) {
            for (const comp of event?.competitions || []) {
                for (const player of comp?.competitors || []) {
                    const name = player?.athlete?.displayName;
                    if (!name) continue;
                    const scoreStr = player?.score;
                    let score = 0;
                    if (scoreStr && scoreStr !== 'E' && scoreStr !== 'EVEN') {
                        const parsed = parseInt(scoreStr.replace('+', ''));
                        score = isNaN(parsed) ? 0 : parsed;
                    }
                    scores[name] = score;
                }
            }
        }

        res.status(200).json({ scores, eventName: events[0]?.name || 'No event' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
