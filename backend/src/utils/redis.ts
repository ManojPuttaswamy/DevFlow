import Redis from 'ioredis';


class RedisService {
    private client: Redis | null = null;

    constructor() {
        this.connect();
    }

    private connect() {
        try {
            if (process.env.REDIS_URL) {
                // When using REDIS_URL, pass it directly as string
                this.client = new Redis(process.env.REDIS_URL, {
                    maxRetriesPerRequest: 3,
                    lazyConnect: true,
                    connectTimeout: 10000,
                    commandTimeout: 5000,
                });

                this.client.on('connect', () => {
                    console.log('Redis connected');
                });

                this.client.on('ready', () => {
                    console.log('Redis ready for commands');
                });

                this.client.on('error', (error: any) => {
                    console.error('Redis connection error:', error);
                    this.client = null;
                });

                this.client.on('close', () => {
                    console.log('Redis connection closed');
                });

                this.client.on('reconnecting', () => {
                    console.log('Redis reconnecting...');
                });
            } else {
                // Fallback to individual host/port configuration
                const host = process.env.REDIS_HOST || 'localhost';
                const port = parseInt(process.env.REDIS_PORT || '6379');

                this.client = new Redis({
                    host,
                    port,
                    maxRetriesPerRequest: 3,
                    lazyConnect: true,
                    connectTimeout: 10000,
                    commandTimeout: 5000,
                });

                this.client.on('connect', () => {
                    console.log('Redis connected');
                });

                this.client.on('error', (error: any) => {
                    console.error(' Redis connection error:', error);
                    this.client = null;
                });

                console.log(` Redis configured for ${host}:${port}`);
            }
        } catch (error) {
            console.error(' Redis initialization error:', error);
            this.client = null;
        }
    }

    async set(key: string, value: string, ttl?: number): Promise<boolean> {
        if (!this.client) return false;
        try {
            if (ttl) {
                await this.client.setex(key, ttl, value);
            }
            else {
                await this.client.set(key, value);
            }
            return true;
        }
        catch (error) {
            console.error('Redis SET error: ', error);
            return false;
        }
    }

    async get(key: string): Promise<string | null> {
        if (!this.client) return null;
        try {
            return await this.client.get(key);
        }
        catch (error) {
            console.error('Redis GET error: ', error);
            return null;
        }
    }

    async del(key: string): Promise<boolean> {
        if (!this.client) return false;
        try {
            await this.client.del(key);
            return true;
        }
        catch (error) {
            console.error('Redis DEL error:', error);
            return false;
        }
    }

    async exists(key: string): Promise<boolean> {
        if (!this.client) return false;
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error('Redis EXISTS error:', error);
            return false;
        }
    }

    isConnected(): boolean {
        return this.client?.status === 'ready';
    }
}

export const redis = new RedisService();