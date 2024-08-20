import Redis from 'ioredis';
import { DeploymentJob } from "@/server/queues/lib/types";
import { DEPLOYMENTS_QUEUE_NAME } from "@/server/queues/queueSetup";

const redis = new Redis();

export async function makeRedisStreamsWorker(
    handler: (msg: DeploymentJob) => void
) {
    let isRunning = true;
    return {
        async run() {
            while (isRunning) {
                const results = await redis.xread(
                    'BLOCK', 0,
                    'STREAMS', DEPLOYMENTS_QUEUE_NAME, '0'
                );

                if (results) {
                    results.forEach(([id, messages]) => {
                        for (const [_, fields] of messages) {
                            const messageField = fields[1];
                            if (messageField) {
                                const decodedMessage: DeploymentJob = JSON.parse(messageField);
                                handler(decodedMessage);
                            }
                        }
                        redis.xack(DEPLOYMENTS_QUEUE_NAME, 'group-name', id);
                    })
                }
            }
        },
        async stop() {
            isRunning = false;
        }
    };
}
