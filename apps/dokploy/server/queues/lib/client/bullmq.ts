import {getBullMQConnection} from "@/server/queues/lib/connection/bullmq";
import {DeploymentJob, GenericClient} from "@/server/queues/lib/types";

export const getBullMQClient = async (): Promise<GenericClient> => {
    const connection = getBullMQConnection()
    return {
        async add(job: DeploymentJob) {
            await connection.add("deployments",
                {...job},
                {
                    removeOnComplete: true,
                    removeOnFail: true,
                })
        },
        async cleanQueuesByApplication(applicationId: string) {
            const jobs = await connection.getJobs(["waiting", "delayed"]);

            for (const job of jobs) {
                if (job?.data?.applicationId === applicationId) {
                    await job.remove();
                    console.log(`Removed job ${job.id} for application ${applicationId}`);
                }
            }
        },
        async cleanQueuesByCompose(composeId: string) {
            const jobs = await connection.getJobs(["waiting", "delayed"]);

            for (const job of jobs) {
                if (job?.data?.composeId === composeId) {
                    await job.remove();
                    console.log(`Removed job ${job.id} for compose ${composeId}`);
                }
            }
        }
    }
}