
/* eslint-disable @typescript-eslint/no-explicit-any */
export const SocketEvents = (socket: any) => {
    // User joins event room
    socket.on("join-event", (eventId: string) => {
        socket.join(`event:${eventId.trim()}`);
    });

}