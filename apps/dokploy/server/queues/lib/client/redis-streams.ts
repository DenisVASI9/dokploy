import { DeploymentJob, GenericClient } from "@/server/queues/lib/types";
import { DEPLOYMENTS_QUEUE_NAME } from "@/server/queues/queueSetup";
import { getRedisConnection } from "@/server/queues/lib/connection/redis";

export const getRedisStreamsClient = async (): Promise<GenericClient> => {
    const client = await getRedisConnection();
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
