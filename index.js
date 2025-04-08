// node server which wil handle socket io connection
const http = require("http");
const { Server } = require("socket.io");
const fs=require ("fs");
const path=require("path");
// Create an HTTP server
const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (Adjust if needed)
        methods: ["GET", "POST"]
    }
});

const users={};
const uploadDir = path.join(__dirname, "uploads");

// Create uploads directory if not exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log("Uploads directory created.");
}
io.on('connection', (socket)=>{
    console.log("New connection:", socket.id);

    socket.on('new-user-joined', (name)=>{
        console.log("new user:", name)
        users[socket.id]=name;
        socket.broadcast.emit('user-joined', name);
    });
    socket.on('send', (message)=>{
        socket.broadcast.emit('receive', {message, name:users[socket.id]})
    });
    socket.on("audio", (audioBlob) => {
        console.log("Audio Received");

        const filename = `audio_${Date.now()}.wav`;
        const filePath = path.join(__dirname, "uploads", filename);
        const buffer = Buffer.from(audioBlob);

        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                console.error("Failed to save audio:", err);
            } else {
                console.log(`Audio Saved: ${filename}`);
            }
        });
    });

    socket.on("disconnect", () => {
        if (users[socket.id]) {
            socket.broadcast.emit("left", users[socket.id]);
            delete users[socket.id];
        }
    });
});
server.listen(8000, () => {
    console.log("Server running on port 8000");
});