let recognition;
let isListening = false;

// Initialize Speech Recognition
function initRecognition() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = function() {
        console.log('Voice recognition started.');
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        console.log('You said: ', transcript);
        document.getElementById('userInput').value = transcript;
        sendMessage();
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error detected:', event.error);
    };

    recognition.onspeechend = function() {
        stopListening();
    };
}

// Start Listening
function startListening() {
    if (!isListening) {
        if (!recognition) {
            initRecognition();
        }
        recognition.start();
        isListening = true;
    }
}

// Stop Listening
function stopListening() {
    if (isListening && recognition) {
        recognition.stop();
        isListening = false;
    }
}

// Text-to-Speech
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

// Handle UI events
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

document.getElementById('sendButton').addEventListener('click', sendMessage);
document.getElementById('voiceModeButton').addEventListener('click', () => {
    document.getElementById('voiceModal').style.display = 'block';
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('voiceModal').style.display = 'none';
    stopListening(); // Ensure listening is stopped when closing the modal
});

document.getElementById('voiceControl').addEventListener('click', startListening);

// Send a message to the server
async function sendMessage() {
    const userInputField = document.getElementById('userInput');
    const userInput = userInputField.value.trim();

    if (userInput === "") {
        alert("Please enter a message.");
        return;
    }

    // Clear the input field to simulate the message being sent
    userInputField.value = ""; 

    const data = {
        user: userInput,
        bridge_id: "67c82ab5476464b734b1a383",
        response_type: "text"
    };

    displayMessage("user-message", userInput);

    try {
        const response = await fetch('https://api.gtwy.ai/api/v2/model/chat/completion', {
            method: 'POST',
            headers: {
                'pauthkey': 'f539788ba482fb40a54460f61007864d',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        const aiContent = result.response.data.content;

        displayMessage("ai-message", aiContent);
        speak(aiContent);
        
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        alert("There was an error sending your message.");
    }
}

// Display messages in the chat area
function displayMessage(type, message) {
    const chatArea = document.getElementById('chat-area');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.textContent = message;
    chatArea.appendChild(messageElement);

    // Scroll to the latest message
    chatArea.scrollTop = chatArea.scrollHeight;
}