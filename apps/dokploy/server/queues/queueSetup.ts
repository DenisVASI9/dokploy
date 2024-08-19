import { type ConnectionOptions as RedisConnectionOptions, Queue } from "bullmq";
import { type ConnectionOptions as NatsConnectionOptions} from "nats";
import {getGenericConnection} from "@/server/queues/lib/connection";
import {DeploymentWorkerType} from "@/server/queues/lib/types";
import {getGenericClient} from "@/server/queues/lib/client";

export const redisConfig: RedisConnectionOptions = {
	host: process.env.NODE_ENV === "production" ? "dokploy-redis" : "127.0.0.1",
	port: 6379,
};

export const natsConfig: NatsConnectionOptions = {
	servers: process.env.NODE_ENV === "production" ? 'dokploy-nats:4222': '127.0.0.1:4222',
}

export const DEPLOYMENTS_QUEUE_NAME = "deployments"

const getDeploymentQueueTransport = (): DeploymentWorkerType => {
	switch (process.env.TRANSPORT_TYPE) {
		case "NATS": {
			return DeploymentWorkerType.NATS
		}
		case "BullMQ": {
			return DeploymentWorkerType.BullMQ
		}
		default: {
			throw new Error("Transport type required. Set TRANSPORT_TYPE=<NATS | BullMQ> in .env file")
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
