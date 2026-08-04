import type { Socket } from "socket.io";

export class SocketAuthenticator {
    authenticate(socket:Socket): 'admin'|'viewer'|null {
        const role = socket.handshake.auth.role;

        if (role !== "admin" && role !== "viewer") {
            return null;
        }

        return role;
    }
}