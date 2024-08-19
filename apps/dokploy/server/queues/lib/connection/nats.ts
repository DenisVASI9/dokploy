import {connect, NatsConnection} from 'nats';
import {DEPLOYMENTS_QUEUE_NAME, natsConfig} from "@/server/queues/queueSetup";

let connection: NatsConnection | null = null;

export const getNATSConnection = async () => {
    if (!connection) {
        connection = await connect(natsConfig);
        const js = connection.jetstream();
        const manager = await js.jetstreamManager();

        const streams = await manager.streams.list().next();
        const streamExists = streams.some(stream => stream.config.name === DEPLOYMENTS_QUEUE_NAME);

        if (!streamExists) {
            await manager.streams.add({
                name: DEPLOYMENTS_QUEUE_NAME,
                subjects: ["deploymentWorker"]
            })
        }
    }

    return connection;
}