import {DeploymentJob} from "@/server/queues/lib/types";
import {DEPLOYMENTS_QUEUE_NAME} from "@/server/queues/queueSetup";
import {getRedisConnection} from "@/server/queues/lib/connection/redis";

export async function makeRedisWorker(
    handler: (msg: DeploymentJob) => void
) {
    let client = await getRedisConnection()
    let isRunning = true;

    const keyType = await client.type(DEPLOYMENTS_QUEUE_NAME);

    if (keyType !== 'list') {
        if (keyType !== 'none') {
            console.log(`Key "${DEPLOYMENTS_QUEUE_NAME}" is not a list (actual type: ${keyType}), deleting it.`);
            await client.del(DEPLOYMENTS_QUEUE_NAME);
        }
    }

    return {
        async run() {
            while (isRunning) {

                const result = await client.blpop(DEPLOYMENTS_QUEUE_NAME, 0);
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
