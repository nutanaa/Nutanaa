const renderChatWidget = () => {
    // Add styles dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        #chat-widget {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 1000;
        }
        #chat-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--color-accent);
            color: white;
            border: none;
            box-shadow: var(--shadow-glow);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            transition: transform 0.2s;
        }
        #chat-button:hover {
            transform: scale(1.1);
        }
        #chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 300px;
            height: 400px;
            background: var(--color-bg-secondary);
            border: 1px solid var(--color-bg-tertiary);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            display: none;
            flex-direction: column;
            overflow: hidden;
        }
        #chat-window.open {
            display: flex;
        }
        .chat-header {
            padding: 1rem;
            background: var(--color-bg-tertiary);
            font-weight: bold;
            display: flex;
            justify-content: space-between;
        }
        .chat-body {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            color: var(--color-text-secondary);
            font-size: 0.9rem;
        }
        .chat-input {
            padding: 0.75rem;
            border-top: 1px solid var(--color-bg-tertiary);
            display: flex;
        }
    `;
    document.head.appendChild(style);

    const widget = document.createElement('div');
    widget.id = 'chat-widget';
    widget.innerHTML = `
        <div id="chat-window">
            <div class="chat-header">
                <span>Live Support</span>
                <span style="cursor: pointer;" onclick="document.getElementById('chat-window').classList.remove('open')">✕</span>
            </div>
            <div class="chat-body">
                <p>Hello! How can we help you with your franchise or order today?</p>
            </div>
            <div class="chat-input">
                <input type="text" placeholder="Type a message..." style="width: 100%; bg: transparent; border: none; outline: none; color: white;">
            </div>
        </div>
        <button id="chat-button" onclick="document.getElementById('chat-window').classList.toggle('open')">
            💬
        </button>
    `;

    document.body.appendChild(widget);
};

export default renderChatWidget;
