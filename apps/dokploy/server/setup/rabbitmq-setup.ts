import type { CreateServiceOptions } from "dockerode";
import { docker } from "../constants";
import { pullImage } from "../utils/docker/utils";

export const initializeRabbitMQ = async () => {
    const imageName = "rabbitmq:3.13.6-management-alpine";
    const containerName = "dokploy-rabbitmq";

    const settings: CreateServiceOptions = {
        Name: containerName,
        TaskTemplate: {
            ContainerSpec: {
                Env: ["RABBITMQ_DEFAULT_USER=admin", "RABBITMQ_DEFAULT_PASS=08q7vcgyvqv32fcc2c12s"],
                Image: imageName,
                Mounts: [
                    {
                        Type: "volume",
                        Source: "dokploy-rabbitmq",
                        Target: "/data",
                    },
                ],
            },
            Networks: [{ Target: "dokploy-network" }],
            Placement: {
                Constraints: ["node.role==manager"],
            },
        },
        Mode: {
            Replicated: {
                Replicas: 1,
            },
        },
        EndpointSpec: {
            Ports: [
                {
                    TargetPort: 15672,
                    PublishedPort: process.env.NODE_ENV === "development" ? 15672 : 0,
                    Protocol: "tcp",
                    PublishMode: "host",
                },
                {
                    TargetPort: 5672,
                    PublishedPort: process.env.NODE_ENV === "development" ? 5672 : 0,
                    Protocol: "tcp",
                    PublishMode: "host",
                },
            ],
        },
    };
    try {
        await pullImage(imageName);

        const service = docker.getService(containerName);
        const inspect = await service.inspect();
        await service.update({
            version: Number.parseInt(inspect.Version.Index),
            ...settings,
        });
        console.log("RabbitMQ Started ");
    } catch (error) {
        await docker.createService(settings);
        console.log("RabbitMQ Not Found: Starting");
    }
};
