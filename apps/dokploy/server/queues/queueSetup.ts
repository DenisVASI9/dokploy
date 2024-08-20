import {type ConnectionOptions as RedisConnectionOptions} from "bullmq";
import {type Options} from "amqplib";
import {getGenericConnection} from "@/server/queues/lib/connection";
import {getGenericClient} from "@/server/queues/lib/client";
import {getDeploymentQueueTransport} from "@/server/queues/lib/env";

export const bullConfig: RedisConnectionOptions = {
    host: process.env.NODE_ENV === "production" ? "dokploy-redis" : "127.0.0.1",
    port: 6379,
};

export const redisConfig = {
    host: process.env.NODE_ENV === "production" ? "dokploy-redis" : "127.0.0.1",
    port: 6379,
};

export const rabbitMQConfig: Options.Connect = {
    hostname: process.env.NODE_ENV === "production" ? "dokploy-rabbitmq" : "127.0.0.1",
    port: 5672,
    username: 'admin',
    password: '08q7vcgyvqv32fcc2c12s',
}

export const DEPLOYMENTS_QUEUE_NAME = "deployments"

export const TRANSPORT_TYPE = getDeploymentQueueTransport()

getGenericConnection().then((connection) => {
    process.on("SIGTERM", async () => {
        await connection.close();
        process.exit(0);
    });
})

const client = await getGenericClient()

export {client}
