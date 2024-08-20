import { DeploymentJob, GenericClient } from "@/server/queues/lib/types";
import { DEPLOYMENTS_QUEUE_NAME } from "@/server/queues/queueSetup";
import { getRedisConnection } from "@/server/queues/lib/connection/redis";

export const getRedisStreamsClient = async (): Promise<GenericClient> => {
    const client = await getRedisConnection();

    const keyType = await client.type(DEPLOYMENTS_QUEUE_NAME);

    if (keyType !== 'stream') {
        if (keyType !== 'none') {
            console.log(`Key "${DEPLOYMENTS_QUEUE_NAME}" is not a stream (actual type: ${keyType}), deleting it.`);
            await client.del(DEPLOYMENTS_QUEUE_NAME);
        }
    }

    return {
        async add(job: DeploymentJob) {
            const jobId = await client.xadd(
                DEPLOYMENTS_QUEUE_NAME,
                '*',
                'job', JSON.stringify(job)
            );

            console.log(`Job added to stream: ${DEPLOYMENTS_QUEUE_NAME}`, jobId, job);
        },
        async cleanQueuesByApplication(applicationId: string) {
            throw new Error('cleanQueuesByApplication not implemented');
        },
        async cleanQueuesByCompose(composeId: string) {
            throw new Error('cleanQueuesByCompose not implemented');
        },
    };
};
