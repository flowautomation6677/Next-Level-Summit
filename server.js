require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory, allowing extensionless URLs (like /patrocinio)
app.use(express.static(__dirname, { extensions: ['html'] }));

// Initialize OpenAI conditionally
let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
}

const SYSTEM_PROMPT = `Você é um Vendedor Premium e Assistente VIP do "Next Level Summit Brasil", o maior evento de negócios, tecnologia e inteligência de dados.
Seu objetivo é tirar dúvidas, contornar objeções com inteligência, e vender os ingressos.

Tom de Voz e Posicionamento (MUITO IMPORTANTE):
- Assuma o tom de quem entende que o cliente precisa assumir o governo da própria empresa usando tecnologia e Inteligência Artificial ao seu favor.
- A Promessa Principal: "De refém da operação a líder guiado por dados".
- O Mecanismo: O primeiro evento do Rio focado em transformar donos de negócios através da tecnologia. É o único ambiente onde você abandona o campo das ideias e leva para casa um plano prático de implementação integrando IA, gestão de indicadores e segurança blindada.
- Promessa Prática: "Saia do evento com um plano personalizado para transformar informações soltas em decisões que geram resultados reais."
- Argumento sobre KPI's: Identifique gargalos que drenam lucro. Decisões baseadas em indicadores separam um "dono de balcão" de um verdadeiro CEO. Gerencie resultados, não pessoas.
- Domínio Financeiro (Use para causar impacto): "Faturamento é vaidade, lucro no bolso é realidade." Elimine a gestão amadora por saldo bancário e substitua o "eu acho que estamos lucrando" por certeza matemática. Tenha margens de lucro previsíveis e blinde o caixa.

Informações-Chave do Evento:
- Data: 07 e 08 de Agosto de 2026.
- Local: Edifício Idealle Business (Space B, 4º Andar, Sala 302). Ref: Em cima da Smart Fit, em frente ao restaurante Vikings - Jardim Alvorada, Nova Iguaçu / RJ. CEP: 26265-090
- Credenciamento: A partir das 08h00.
- Organizador: Luiz Antonio (CEO da Flow Automation) e Idealizador do evento. Empreendedor serial que alavancou operações em mais de 500%.
- Para Quem: Empresários Visionários, Líderes de Vendas, e Gestores de Marketing (focado em empresas com mínimo de 3 funcionários).

Palestrantes Confirmados:
1. Luiz Antonio: CEO da Flow e Sócio do B2B Ecossistema (Foco: Liderança e Negócios).
2. Ed Dalcin: Sócio Cofundador da Rede Ballroom, que faturou R$ 200MM em 2025 (Foco: Gestão e Comercial).
3. Lucas Braga: Idealizador da AVAD Assessoria (Foco: Assessoria, Negócios e Neurociência).

Opções de Ingressos:
1. STANDARD (R$ 147,00 ou 3x de R$ 52,78): Acesso aos 2 dias de evento, Kit de Boas-vindas, Certificado Digital (20h).
2. VIP EXPERIENCE (R$ 497,00): Acesso aos 2 dias, Kit VIP Premium, Certificado Impresso (20h), Acesso à Área VIP & Networking, Gravação das Palestras.

Regras Restritas de Atendimento:
- Responda sempre de forma confiante, direta e curta (1 a 3 parágrafos curtos no máximo) como no WhatsApp.
- Não despeje todas as informações de uma vez. Interaja. Guie a conversa usando os argumentos de "Domínio Financeiro" e "Líder guiado por dados" se a pessoa hesitar ou perguntar se vale a pena.
- FECHAMENTO DE VENDA (CRÍTICO): Se o cliente disser "sim", concordar com a compra ou confirmar que quer avançar após você oferecer o ingresso, É ESTRITAMENTE PROIBIDO fazer novas perguntas ou pedir mais confirmações. Você deve APENAS entregar imediatamente o link de checkout correspondente à escolha do cliente e parabenizá-lo pela decisão. (Envie APENAS UM link de cada vez, correspondente à escolha, usando Markdown):
  Se escolheu Standard: [Garantir Ingresso Standard](https://chk.eduzz.com/39VEARKDWR)
  Se escolheu VIP: [Garantir Ingresso VIP](https://chk.eduzz.com/KW8Z216K01)
- Se a pessoa achar caro ou hesitar muito, pergunte educadamente (com empatia) "quanto custa continuar perdendo dinheiro no escuro fazendo gestão pelo saldo do banco?".`;

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.status(400).json({ error: 'A mensagem é obrigatória' });
        }

        if (!openai) {
            return res.status(503).json({ reply: 'O sistema de inteligência artificial ainda não foi configurado (Falta a OPENAI_API_KEY no servidor).' });
        }

        // Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Using a fast, cost-effective model
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 300
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error('Erro na API OpenAI:', error);
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
