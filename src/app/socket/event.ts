/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

export const SocketEvents = (socket: any) => {

    // User joins their personal room
    socket.on("join-user", (userId: string) => {
        socket.join(userId);
        console.log("User joined in the room: ", userId);
    })

    // User joins event room
    socket.on("join-event", (eventId: string) => {
        socket.join(`event:${eventId.trim()}`);
    });

}