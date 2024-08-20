import amqp, {Channel, Connection} from 'amqplib';
import {Mutex} from 'async-mutex';
import {DEPLOYMENTS_QUEUE_NAME, rabbitMQConfig} from "@/server/queues/queueSetup";

const mutex = new Mutex();
let connection: Connection | null = null;
let channel: Channel | null = null;

const connectWithRetry = async (): Promise<Connection> => {
    const maxRetries = 5;
    let retries = maxRetries;
    while (retries > 0) {
        console.log(`Connecting to RabbitMQ attempt ${maxRetries - retries + 1}`);
        try {
            return await amqp.connect(rabbitMQConfig);
        } catch (err) {
            console.error('Failed to connect to RabbitMQ, retrying...', err);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
        }
    }
    throw new Error('Could not connect to RabbitMQ after several attempts');
};

export const getRabbitMQConnection = async (): Promise<Channel> => {
    return mutex.runExclusive(async () => {
        if (!connection || !channel) {
            connection = await connectWithRetry();
            channel = await connection.createChannel();

            const queue = await channel.assertQueue(DEPLOYMENTS_QUEUE_NAME, {
                durable: true,
            });

            console.log(`Queue ${queue.queue} is available and durable.`);
        }

        return channel;
    });
};
