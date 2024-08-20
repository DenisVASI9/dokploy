import {DeploymentWorkerType, GenericConnection} from "@/server/queues/lib/types";
import {getBullMQConnection} from "@/server/queues/lib/connection/bullmq";
import {TRANSPORT_TYPE} from "@/server/queues/queueSetup";
import {getRabbitMQConnection} from "@/server/queues/lib/connection/rabbitmq";

export const getGenericConnection = async (): Promise<GenericConnection> => {
    switch (TRANSPORT_TYPE) {
        case DeploymentWorkerType.RABBITMQ: {
            const connection = await getRabbitMQConnection()
            return {
                async close() {
                    await connection.close()
                }
            }
        }
        default: {
            const connection = getBullMQConnection()
            return {
                async close() {
                    await connection.close()
                }
            }
        }
    }
}