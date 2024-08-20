import {DeploymentJob, WorkerHandler} from "@/server/queues/lib/types";
import {type Job, Worker} from "bullmq";
import {bullConfig} from "@/server/queues/queueSetup";

export const makeBullMQWorker = (handler: WorkerHandler) => {
    const worker = new Worker(
        "deployments",
        (job: Job<DeploymentJob>) => handler(job.data),
        {
            autorun: false,
            connection: bullConfig,
        })
    return {
        async run() {
            await worker.run()
        },
        async stop() {
            await worker.close()
        }
    }
}