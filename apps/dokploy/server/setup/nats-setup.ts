import type { CreateServiceOptions } from "dockerode";
import { docker } from "../constants";
import { pullImage } from "../utils/docker/utils";

export const initializeNats = async () => {
    const imageName = "nats:2.10.18-alpine3.20";
    const containerName = "dokploy-nats";

    const settings: CreateServiceOptions = {
        Name: containerName,
        TaskTemplate: {
            ContainerSpec: {
                // Command: [],
                Args: ["-js"],
                Image: imageName,
                Mounts: [
                    {
                        Type: "volume",
                        Source: "dokploy-nats",
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
                    TargetPort: 4222,
                    PublishedPort: process.env.NODE_ENV === "development" ? 4222 : 0,
                    Protocol: "tcp",
                    PublishMode: "host",
                },
                {
                    TargetPort: 8222,
                    PublishedPort: process.env.NODE_ENV === "development" ? 8222 : 0,
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
        console.log("NATS Started ");
    } catch (error) {
        await docker.createService(settings);
        console.log("NATS Not Found: Starting");
    }
};
