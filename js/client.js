const socket = io('http://localhost:8000');
const form = document.getElementById('send');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
const mic = document.querySelector('.but');
let mediaRecorder;
let audioChunks = [];

// Append Message
const append = (message, position) => {
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
}

// Form Submit Event
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = '';
});

// Username Prompt
const yourname = prompt("Enter your name");
socket.emit('new-user-joined', yourname);

socket.on('user-joined', (name) => {
    append(`${name} joined the chat`, 'right');
});

socket.on('receive', (data) => {
    append(`${data.name}: ${data.message}`, 'left');
    const receiveSound = document.getElementById('receiveSound');
    if (receiveSound) {
        receiveSound.play().catch((err) => {
            console.warn("Receive sound failed to play:", err);
        });
    }
});

socket.on('left', (name) => {
    append(`${name} left the chat`, 'left');
});
// Mic Voice Recording

mic.addEventListener('click', async (e) => {
    if (e.target === mic) {
        e.preventDefault(); // Important 
        e.stopPropagation();
    }

    console.log("Mic Clicked...");

    if (!mediaRecorder) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioChunks = [];
            const arrayBuffer = await audioBlob.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            socket.emit('audio', buffer);
            console.log("Audio Sent Successfully");
        };

        mediaRecorder.start();
        console.log("🎤 Mic Recording Started...");
        alert("Mic is Recording... Click Again to Stop");

    } else if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        console.log("🎤 Mic Recording Stopped");
        mediaRecorder = null;
    }
});
