/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

export const SocketEvents = (socket: any) => {
 
    socket.on("message", (msg: string) => {
        console.log("message event: ", msg);
        socket.emit("receive_message", msg);
    });
    
}