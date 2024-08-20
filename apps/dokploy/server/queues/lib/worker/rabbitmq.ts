import {DeploymentJob} from "@/server/queues/lib/types";
import {DEPLOYMENTS_QUEUE_NAME} from "@/server/queues/queueSetup";
import {Channel, ConsumeMessage} from 'amqplib';
import {getRabbitMQConnection} from "@/server/queues/lib/connection/rabbitmq";

export async function makeRabbitMQWorker(
    handler: (msg: DeploymentJob) => void
) {
    const channel: Channel = await getRabbitMQConnection();

    await channel.assertQueue(DEPLOYMENTS_QUEUE_NAME, {
        durable: true, // Ensure the queue is durable
    });

    return {
        run: () => {
            channel.consume(DEPLOYMENTS_QUEUE_NAME, (msg: ConsumeMessage | null) => {
                if (msg) {
                    const decodedMessage: DeploymentJob = JSON.parse(msg.content.toString());
                    handler(decodedMessage);
                    channel.ack(msg);
                }
            }, {
                noAck: false,
            });

            console.log(`Worker is now consuming messages from ${DEPLOYMENTS_QUEUE_NAME}`);
        }
    };
}
