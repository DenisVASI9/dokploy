import {Queue} from "bullmq";
import {bullConfig} from "@/server/queues/queueSetup";

let connection: Queue | null = null;

export const getBullMQConnection = () => {
    if (!connection) {
        // TODO: maybe add a options to clean the queue to the times
        connection = new Queue("deployments", {
            connection: bullConfig,
        });

        connection.on("error", (error) => {
            if ((error as any).code === "ECONNREFUSED") {
                console.error(
                    "Make sure you have installed Redis and it is running.",
                    error,
                );
            }
        });
    }

    return connection
}