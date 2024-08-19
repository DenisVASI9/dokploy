import {DeploymentWorkerType} from "@/server/queues/lib/types";
import {getBullMQClient} from "@/server/queues/lib/client/bullmq";
import {getNATSClient} from "@/server/queues/lib/client/nats";
import {TRANSPORT_TYPE} from "@/server/queues/queueSetup";

export const getGenericClient = () => {
    switch (TRANSPORT_TYPE) {
        case DeploymentWorkerType.NATS: {
            return getNATSClient()
        }
        case DeploymentWorkerType.BullMQ: {
            return getBullMQClient()
        }
        default: {
            return getBullMQClient()
        }
    }
}

