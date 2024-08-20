import Redis from 'ioredis';
import {DeploymentJob} from "@/server/queues/lib/types";
import {DEPLOYMENTS_QUEUE_NAME} from "@/server/queues/queueSetup";

const redis = new Redis();

export async function makeRedisWorker(
    handler: (msg: DeploymentJob) => void
) {
    let isRunning = true;
    return {
        async run() {
            while (isRunning) {
                const result = await redis.blpop(DEPLOYMENTS_QUEUE_NAME, 0);
                if (result) {
                    const [, message] = result;
                    const decodedMessage: DeploymentJob = JSON.parse(message);
                    handler(decodedMessage);
                }
            }
        },
        async stop() {
            isRunning = false;
        }
    };
}
