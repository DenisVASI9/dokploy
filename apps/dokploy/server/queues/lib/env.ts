import {DeploymentWorkerType} from "@/server/queues/lib/types";

export const getDeploymentQueueTransport = (): DeploymentWorkerType => {
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