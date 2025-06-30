export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    firstname?: string;
    lastname?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        username: string;
        password: string;
        firstname?: string;
        lastname?: string;
        verified : boolean;
    };
    token: string;
}

export interface JWTPayload {
    userId: string;
    email : string;
    iat: number;
    exp: number;
}