import {DeploymentJob, GenericClient} from "@/server/queues/lib/types";
import {DEPLOYMENTS_QUEUE_NAME} from "@/server/queues/queueSetup";
import {getRedisConnection} from "@/server/queues/lib/connection/redis";

export const getRedisClient = async (): Promise<GenericClient> => {
    const client = await getRedisConnection();
    return {
        async add(job: DeploymentJob) {
            const jobString = JSON.stringify(job);

            await client.rpush(DEPLOYMENTS_QUEUE_NAME, jobString); // Push job to the end of the queue

            console.log(`Job added to queue: ${DEPLOYMENTS_QUEUE_NAME}`, job);
        },
        async cleanQueuesByApplication(applicationId: string) {
            throw new Error('cleanQueuesByApplication not implemented');
        },
        async cleanQueuesByCompose(composeId: string) {
            throw new Error('cleanQueuesByCompose not implemented');
        },
    };
};
