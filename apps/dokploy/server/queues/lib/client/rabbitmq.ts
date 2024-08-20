import {DeploymentJob} from "@/server/queues/lib/types";
import {DEPLOYMENTS_QUEUE_NAME} from "@/server/queues/queueSetup";
import {Channel} from "amqplib";
import {getRabbitMQConnection} from "@/server/queues/lib/connection/rabbitmq";

export const getRabbitMQClient = async () => {
    const channel: Channel = await getRabbitMQConnection();

    return {
        async add(job: DeploymentJob) {
            const jobBuffer = Buffer.from(JSON.stringify(job));

            channel.sendToQueue(DEPLOYMENTS_QUEUE_NAME, jobBuffer, {
                persistent: true,
            });

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