import { type ConnectionOptions as RedisConnectionOptions } from "bullmq";
import { type Options } from "amqplib";
import {getGenericConnection} from "@/server/queues/lib/connection";
import {DeploymentWorkerType} from "@/server/queues/lib/types";
import {getGenericClient} from "@/server/queues/lib/client";

export const redisConfig: RedisConnectionOptions = {
	host: process.env.NODE_ENV === "production" ? "dokploy-redis" : "127.0.0.1",
	port: 6379,
};

export const rabbitMQConfig:  Options.Connect = {
	hostname: process.env.NODE_ENV === "production" ? "dokploy-rabbitmq" : "127.0.0.1",
	port: 5672,
	username: 'admin',
	password: '08q7vcgyvqv32fcc2c12s',
}

export const DEPLOYMENTS_QUEUE_NAME = "deployments"

const getDeploymentQueueTransport = (): DeploymentWorkerType => {
	switch (process.env.TRANSPORT_TYPE) {
		case "RABBITMQ": {
			return DeploymentWorkerType.RABBITMQ
		}
		case "BullMQ": {
			return DeploymentWorkerType.BullMQ
		}
		default: {
			throw new Error("Transport type required. Set TRANSPORT_TYPE=<RABBITMQ | BullMQ> in .env file")
		}
	}
}

export const TRANSPORT_TYPE = getDeploymentQueueTransport()

getGenericConnection().then((connection) => {
	process.on("SIGTERM", () => {
		connection.close();
		process.exit(0);
	});
})

const client = await getGenericClient()

export { client }
