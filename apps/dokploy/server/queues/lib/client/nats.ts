import {JetStreamClient, JSONCodec} from 'nats';
import {getNATSConnection} from "@/server/queues/lib/connection/nats";
import {DeploymentJob} from "@/server/queues/lib/types";

export const getNATSClient = async () => {
    const js: JetStreamClient = await getNATSConnection().then((connection) => connection.jetstream())
    const jc = JSONCodec<DeploymentJob>();

    return {
        add(job: DeploymentJob) {
            js.publish('deployments', jc.encode({...job}));
        },
        async cleanQueuesByApplication(applicationId: string) {
            throw new Error("not implemented");
        },
        async cleanQueuesByCompose(composeId: string) {
            throw new Error("not implemented");
        }
    }
}