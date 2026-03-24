document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const quickRepliesContainer = document.getElementById('quick-replies');

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Enable/disable send button
        if (this.value.trim().length > 0) {
            sendBtn.removeAttribute('disabled');
        } else {
            sendBtn.setAttribute('disabled', 'true');
        }
    });

    // Handle Enter key (Shift+Enter for new line)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.value.trim().length > 0) {
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Handle Quick Replies
    const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');
    quickReplyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.innerText;
            sendMessage(text);
            // Hide quick replies after selection
            quickRepliesContainer.style.display = 'none';
        });
    });

    // Handle Form Submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = messageInput.value.trim();
        if (text) {
            sendMessage(text);
            messageInput.value = '';
            messageInput.style.height = 'auto'; // reset height
            sendBtn.setAttribute('disabled', 'true');
            if(quickRepliesContainer) quickRepliesContainer.style.display = 'none';
        }
    });

    // Scroll to bottom helper
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Add user message to UI
    function addUserMessage(text) {
        const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const row = document.createElement('div');
        row.className = 'message-row user-row';
        row.innerHTML = `
            <div class="message-bubble user-bubble">
                <p>${escapeHTML(text)}</p>
            </div>
            <span class="message-time">${time}</span>
        `;
        chatMessages.appendChild(row);
        scrollToBottom();
    }

    // Add bot message to UI
    function addBotMessage(text) {
        const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        const row = document.createElement('div');
        row.className = 'message-row bot-row';
        
        // Formata markdown básico (negrito e links)
        const formattedText = formatBasicMarkdown(text);
        
        row.innerHTML = `
            <div class="message-bubble bot-bubble">
                <p>${formattedText}</p>
            </div>
            <span class="message-time">${time}</span>
        `;
        chatMessages.appendChild(row);
        scrollToBottom();
    }

    // Show typing indicator
    function showTypingIndicator() {
        const row = document.createElement('div');
        row.className = 'message-row bot-row typing-indicator-row';
        row.id = 'active-typing-indicator';
        row.innerHTML = `
            <div class="message-bubble bot-bubble typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        chatMessages.appendChild(row);
        scrollToBottom();
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        const indicator = document.getElementById('active-typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Send Message Logic (UI + API Call)
    async function sendMessage(text) {
        addUserMessage(text);
        showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                throw new Error('Erro na comunicação com o servidor');
            }

            const data = await response.json();
            hideTypingIndicator();
            
            // Quebra a resposta da IA em parágrafos separados e filtra strings vazias
            const paragraphs = data.reply.split('\n\n').filter(p => p.trim().length > 0);
            
            // Mostra os parágrafos um a um com intervalo, simulando a digitação humana
            for (let i = 0; i < paragraphs.length; i++) {
                if (i > 0) {
                    showTypingIndicator();
                    // Calcula o tempo de "digitação" baseando-se no tamanho do parágrafo:
                    // Ex: 25ms por letra, mínimo de 1.5s, máximo de 4s
                    const delay = Math.min(Math.max(paragraphs[i].length * 25, 1500), 4000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    hideTypingIndicator();
                }
                addBotMessage(paragraphs[i]);
            }
            
        } catch (error) {
            console.error('Erro:', error);
            hideTypingIndicator();
            addBotMessage("Desculpe, estou com um pouco de instabilidade na minha rede agora. Pode tentar novamente em alguns segundos?");
        }
    }

    // Utility: Escape HTML to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
    
    // Utility: Simple Markdown formatter
    function formatBasicMarkdown(text) {
        let html = text;
        // Bold: **text**
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic: *text*
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Links: [text](url)
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        return html;
    }
    
    // Check URL parameters for preset intent
    const urlParams = new URLSearchParams(window.location.search);
    const ingressoIntent = urlParams.get('ingresso');
    if(ingressoIntent) {
        setTimeout(() => {
            const intentMap = {
                'vip': 'Quero saber mais sobre o ingresso VIP Experience',
                'standard': 'Quero saber mais sobre o ingresso Standard'
            };
            if(intentMap[ingressoIntent]) {
                const text = intentMap[ingressoIntent];
                messageInput.value = text;
                sendBtn.removeAttribute('disabled');
            }
        }, 1200);
    }
    
    // Initial scroll setup
    setTimeout(scrollToBottom, 500);
});
