import {JetStreamClient, JSONCodec} from 'nats';
import {DeploymentJob} from "@/server/queues/lib/types";
import {getNATSConnection} from "@/server/queues/lib/connection/nats";
import {DEPLOYMENTS_QUEUE_NAME} from "@/server/queues/queueSetup";

export async function makeNATSWorker(
    handler: (msg: DeploymentJob) => void
) {
    const js: JetStreamClient = await getNATSConnection().then((connection) => connection.jetstream());
    const manager = await js.jetstreamManager();

    // durable_name: consumerName, // Имя consumer
    // ack_policy: "explicit", // Политика подтверждения (может быть "none", "all", "explicit")
    // filter_subject: "my.subject.*", // Фильтрация по теме, если нужно
    // deliver_policy: "all", // Политика доставки сообщений (может быть "all", "last", "new", "by_start_sequence", "by_start_time")
    // max_ack_pending: 1000, // Максимальное количество неподтвержденных сообщений
    // deliver_subject: "deliver.to.this.subject", // Тема, на которую будут доставляться сообщения
    // replay_policy: "instant" // Политика воспроизведения (может быть "instant" или "original")
    await manager.consumers.add(DEPLOYMENTS_QUEUE_NAME, {
        durable_name: "deploymentWorker"
    })

    const consumer = await js.consumers.get('deployments', 'deploymentWorker');

    const jc = JSONCodec<DeploymentJob>();

    return {
        run: () => {
            (async () => {
                const messages = await consumer.consume();
                for await (const m of messages) {
                    const decodedMessage = jc.decode(m.data);
                    handler(decodedMessage);
                    m.ack();
                }
            })()
        }
    }
}