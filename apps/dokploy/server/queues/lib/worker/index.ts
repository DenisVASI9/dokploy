import {makeBullMQWorker} from "@/server/queues/lib/worker/bullmq";
import {DeploymentWorkerType, WorkerHandler} from "@/server/queues/lib/types";
import {makeNATSWorker} from "@/server/queues/lib/worker/nats";
import {TRANSPORT_TYPE} from "@/server/queues/queueSetup";

export const useDeploymentWorkers = async (handler: WorkerHandler, count: number = 1) => {
    const workers = [];
    for (let i = 0; i < count; i++) {
        switch (TRANSPORT_TYPE) {
            case DeploymentWorkerType.NATS: {
                workers.push(makeNATSWorker(handler));
                break;
            }
            case DeploymentWorkerType.BullMQ: {
                workers.push(makeBullMQWorker(handler));
                break;
            }
            default: {
                workers.push(makeBullMQWorker(handler))
                break;
            }
        }
    }

    return Promise.all(workers);
}