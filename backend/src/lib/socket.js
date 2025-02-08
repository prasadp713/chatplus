import {Server} from "socket.io"
import http from "http"
import express from "express"


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
})
const userSocketMap = {};

export function getRecevierSocketId(userId){
    return userSocketMap[userId]
}


io.on("connection", (socket) => {
    console.log("a user is connected", socket.id)
    const userId = socket.handshake.query.userId
    if(userId) {
        userSocketMap[userId] = socket.id
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        
        const userIdToDelete = Object.keys(userSocketMap).find(key => userSocketMap[key] === socket.id);
        
        if (userIdToDelete) {
            delete userSocketMap[userIdToDelete];
        }
    
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
})

export {io, app, server}