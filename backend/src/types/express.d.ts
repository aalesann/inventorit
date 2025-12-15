// Extend Express Request type to include custom properties
declare namespace Express {
    export interface Request {
        user?: {
            user_id: number;
            username: string;
            role: 'admin' | 'user';
        };
        io?: any; // Socket.IO server instance
    }
}
