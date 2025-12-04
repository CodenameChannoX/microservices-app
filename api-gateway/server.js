const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Route simple
app.get('/', (req, res) => {
    res.json({
        message: "API Gateway fonctionne ! 🚀",
        services: ["user", "products", "orders"],
        status: "OK"
    });
});

// Route de santé
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Route pour tester
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        data: {
            id: 1,
            name: "Test Object",
            description: "Ceci est un test de l'API"
        }
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`✅ API Gateway démarrée sur http://localhost:${PORT}`);
    console.log(`📡 Essaye : curl http://localhost:${PORT}`);
});
