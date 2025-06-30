export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
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
        firstName?: string | null;
        lastName?: string | null;
        verified: boolean;
        createdAt?: Date;
      };
    token: string;
}

export interface JWTPayload {
    userId: string;
    email : string;
    iat: number;
    exp: number;
}