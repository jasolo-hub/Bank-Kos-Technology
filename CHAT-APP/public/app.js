const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');

const registerButton = document.getElementById('register');
const loginButton = document.getElementById('login');
const regUsernameInput = document.getElementById('reg-username');
const regEmailInput = document.getElementById('reg-email');
const regPasswordInput = document.getElementById('reg-password');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');

const socket = io({ autoConnect: false });

// Handle Registration
registerButton.addEventListener('click', async () => {
    const username = regUsernameInput.value;
    const email = regEmailInput.value;
    const password = regPasswordInput.value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Registration error:', error);
    }
});

// Handle Login
loginButton.addEventListener('click', async () => {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            authContainer.style.display = 'none';
            chatContainer.style.display = 'block';
            initChat();
        } else {
            alert('Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
    }
});

// Initialize chat
function initChat() {
    const token = localStorage.getItem('token');
    const chatSocket = io({ auth: { token } });

    // DOM Elements
    const messages = document.getElementById('messages');
    const messageInput = document.getElementById('message');
    const usernameInput = document.getElementById('username');
    const sendButton = document.getElementById('send');
    const typingIndicator = document.getElementById('typing');

    chatSocket.on('chat message', (data) => {
        const msgElement = document.createElement('div');
        msgElement.textContent = `${data.username}: ${data.message}`;
        messages.appendChild(msgElement);
        messages.scrollTop = messages.scrollHeight;
    });

    chatSocket.on('chat history', (messages) => {
        messages.forEach((message) => {
            const msgElement = document.createElement('div');
            msgElement.textContent = `${message.username}: ${message.message}`;
            messages.appendChild(msgElement);
        });
        messages.scrollTop = messages.scrollHeight;
    });

    chatSocket.on('typing', (username) => {
        if (username) {
            typingIndicator.textContent = `${username} is typing...`;
        } else {
            typingIndicator.textContent = '';
        }
    });

    sendButton.addEventListener('click', () => {
        const message = messageInput.value;
        const username = usernameInput.value || 'Anonymous';

        if (message) {
            chatSocket.emit('chat message', { username, message });
            messageInput.value = '';
        }
    });

    let typingTimeout;
    messageInput.addEventListener('input', () => {
        clearTimeout(typingTimeout);
        chatSocket.emit('typing', usernameInput.value || 'Anonymous');
        typingTimeout = setTimeout(() => {
            chatSocket.emit('typing', '');
        }, 3000);
    });
}
