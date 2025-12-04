const express = require('express');
const app = express();
const PORT = 3000;

// Autoriser CORS pour le frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

app.get('/', (req, res) => {
    res.json({
        message: "✅ API is working!",
        status: "OK",
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ healthy: true });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
    console.log(`🌐 Try: curl http://localhost:${PORT}`);
});
