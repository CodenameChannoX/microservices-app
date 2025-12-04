const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({
    message: "🎯 API en ligne !",
    status: "OK",
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.json({ healthy: true });
});

app.listen(PORT, () => {
  console.log(`✅ API démarrée : http://localhost:${PORT}`);
});
