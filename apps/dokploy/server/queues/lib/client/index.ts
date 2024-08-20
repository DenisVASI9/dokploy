import {DeploymentWorkerType} from "@/server/queues/lib/types";
import {getBullMQClient} from "@/server/queues/lib/client/bullmq";
import {TRANSPORT_TYPE} from "@/server/queues/queueSetup";
import {getRabbitMQClient} from "@/server/queues/lib/client/rabbitmq";
import {getRedisClient} from "@/server/queues/lib/client/redis";

export const getGenericClient = async () => {
    switch (TRANSPORT_TYPE) {
        case DeploymentWorkerType.RABBITMQ: {
            return getRabbitMQClient()
        }
        case DeploymentWorkerType.BullMQ: {
            return getBullMQClient()
        }
        case DeploymentWorkerType.REDIS: {
            return getRedisClient()
        }
        default: {
            return getBullMQClient()
        }
    }
}

