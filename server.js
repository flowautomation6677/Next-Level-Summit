import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getChatReply } from './services/ai.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by'); // Disable implicit version disclosure header
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from the root directory, allowing extensionless URLs (like /patrocinio)
app.use(express.static(__dirname, { extensions: ['html'] }));



app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'O histórico de mensagens é obrigatório' });
        }

        try {
            const reply = await getChatReply(messages);
            res.json({ reply });
        } catch (err) {
            if (err.message === 'NOT_CONFIGURED') {
                return res.status(503).json({ reply: 'O sistema de inteligência artificial ainda não foi configurado (Falta a OPENAI_API_KEY no servidor).' });
            }
            throw err;
        }

    } catch (error) {
        console.error('Erro na API OpenAI:', error);
        
        // Logs específicos para ajudar no debug (Rate limit, Chave inválida, Timeout)
        if (error.response && error.response.data) {
            console.error('Detalhes da Resposta (Axios/HTTP):', error.response.data);
        } else if (error.status) {
            console.error(`Status HTTP da OpenAI: ${error.status}`);
            console.error('Detalhes:', error.error || error.message);
        } else {
            console.error('Mensagem de Erro:', error.message);
        }

        res.status(500).json({ reply: 'Desculpe, meu sistema está com uma leve instabilidade de rede agora. Pode tentar novamente em instantes?' });
    }
});

// Fallback to index.html for unknown routes if it's SPA, but here it's static
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Servidor Next Level rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}/chat.html`);
});
