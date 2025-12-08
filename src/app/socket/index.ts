/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from "socket.io";
import { SocketEvents } from "./event";

export let io: Server;

export const initSocket = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // All events Registered
        SocketEvents(socket);

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
        })
    })
}