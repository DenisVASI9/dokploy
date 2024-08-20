import {DeploymentWorkerType} from "@/server/queues/lib/types";
import {getBullMQConnection} from "@/server/queues/lib/connection/bullmq";
import {TRANSPORT_TYPE} from "@/server/queues/queueSetup";
import {getRabbitMQConnection} from "@/server/queues/lib/connection/rabbitmq";

export const getGenericConnection = async () => {
    switch (TRANSPORT_TYPE) {
        case DeploymentWorkerType.RABBITMQ: {
            const connection = await getRabbitMQConnection()
            return {
                close() {
                    connection.close()
                }
            }
        }
        default: {
            const connection = getBullMQConnection()
            return {
                close() {
                    connection.close()
                }
            }
        }
    }
}