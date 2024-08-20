import {Redis} from 'ioredis';
import {Mutex} from 'async-mutex';
import {redisConfig} from "@/server/queues/queueSetup";

const mutex = new Mutex();
let redisClient: Redis | null = null;

const connectWithRetry = async (): Promise<Redis> => {
    const maxRetries = 5;
    let retries = maxRetries;
    while (retries > 0) {
        console.log(`Connecting to Redis attempt ${maxRetries - retries + 1}`);
        try {
            const client = new Redis(redisConfig);
            await client.ping();
            return client;
        } catch (err) {
            console.error('Failed to connect to Redis, retrying...', err);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
        }
    }
    throw new Error('Could not connect to Redis after several attempts');
};

export const getRedisConnection = async (): Promise<Redis> => {
    return mutex.runExclusive(async () => {
        if (!redisClient) {
            redisClient = await connectWithRetry();
            console.log(`Connected to Redis and ready to use.`);
        }

        return redisClient;
    });
}