import {DeploymentWorkerType} from "@/server/queues/lib/types";
import {getBullMQConnection} from "@/server/queues/lib/connection/bullmq";
import {getNATSConnection} from "@/server/queues/lib/connection/nats";
import {TRANSPORT_TYPE} from "@/server/queues/queueSetup";

export const getGenericConnection = async () => {
    switch (TRANSPORT_TYPE) {
        case DeploymentWorkerType.NATS: {
            const connection = await getNATSConnection()
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