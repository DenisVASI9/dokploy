import {makeBullMQWorker} from "@/server/queues/lib/worker/bullmq";
import {DeploymentWorkerType, WorkerHandler} from "@/server/queues/lib/types";
import {TRANSPORT_TYPE} from "@/server/queues/queueSetup";
import {makeRabbitMQWorker} from "@/server/queues/lib/worker/rabbitmq";
import {makeRedisWorker} from "@/server/queues/lib/worker/redis";

export const useDeploymentWorkers = async (handler: WorkerHandler, count: number = 1) => {
    const workers = [];
    for (let i = 0; i < count; i++) {
        switch (TRANSPORT_TYPE) {
            case DeploymentWorkerType.RABBITMQ: {
                workers.push(makeRabbitMQWorker(handler));
                break;
            }
            case DeploymentWorkerType.BullMQ: {
                workers.push(makeBullMQWorker(handler));
                break;
            }
            case DeploymentWorkerType.REDIS: {
                workers.push(makeRedisWorker(handler));
            }
            default: {
                workers.push(makeBullMQWorker(handler))
                break;
            }
        }
    }

    return Promise.all(workers);
}