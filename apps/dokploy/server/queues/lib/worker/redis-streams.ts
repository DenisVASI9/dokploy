import { DeploymentJob } from "@/server/queues/lib/types";
import { DEPLOYMENTS_QUEUE_NAME } from "@/server/queues/queueSetup";
import { getRedisConnection } from "@/server/queues/lib/connection/redis";

export async function makeRedisStreamsWorker(
    handler: (msg: DeploymentJob) => Promise<void>
) {
    let isRunning = true;

    const client = await getRedisConnection();
    const keyType = await client.type(DEPLOYMENTS_QUEUE_NAME);

    if (keyType !== 'stream') {
        if (keyType !== 'none') {
            console.log(`Key "${DEPLOYMENTS_QUEUE_NAME}" is not a stream (actual type: ${keyType}), deleting it.`);
            await client.del(DEPLOYMENTS_QUEUE_NAME);
        }
    }

    const consumerGroup = `${DEPLOYMENTS_QUEUE_NAME}_group`;
    const consumerName = 'deploymentsWorker';

    const groups = await client.xinfo('GROUPS', DEPLOYMENTS_QUEUE_NAME) as Array<Array<string | number | null>> ;
    const groupIsExists = groups.some(([_, name]) => {
        return typeof name === 'string' && name === consumerGroup;
    })

    if (!groupIsExists) {
        const groupStatus = await client.xgroup('CREATE', DEPLOYMENTS_QUEUE_NAME, consumerGroup, '$', 'MKSTREAM');
        console.log(`Create group ${consumerGroup}: ${groupStatus}`);
    }

    return {
        async run() {
            while (isRunning) {
                const result = await client.xreadgroup(
                    'GROUP',
                    consumerGroup,
                    consumerName,
                    'COUNT',
                    1,
                    // 'BLOCK',
                    // 5000,
                    'STREAMS',
                    DEPLOYMENTS_QUEUE_NAME,
                    '>'
                ) as Array<Array<Array<string | Array<string>>>> | null;

                if (result && result[0]) {
                    const [_, jobs] = result[0];
                    if (jobs?.[0]) {
                        const [_, job] = jobs[0]
                        if (job) {
                            const [_, json] = job
                            if (json) {
                                console.log(`Job received: `, JSON.parse(json));
                                await handler(JSON.parse(json))
                            }
                        }
                    }
                }
            }
        },
        async stop() {
            isRunning = false;
        }
    };
}
