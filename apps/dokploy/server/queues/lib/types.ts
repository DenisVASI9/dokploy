type DeployJob =
    | {
    applicationId: string;
    titleLog: string;
    descriptionLog: string;
    type: "deploy" | "redeploy";
    applicationType: "application";
}
    | {
    composeId: string;
    titleLog: string;
    descriptionLog: string;
    type: "deploy" | "redeploy";
    applicationType: "compose";
};

export type DeploymentJob = DeployJob;

export type WorkerHandler = (job: DeployJob) => Promise<void>

export enum DeploymentWorkerType {
    BullMQ,
    RABBITMQ,
    REDIS
}

export interface GenericClient {
    add: (job: DeploymentJob) => Promise<void>

    cleanQueuesByApplication: (applicationId: string) => Promise<void>

    cleanQueuesByCompose: (composeId: string) => Promise<void>
}

export interface GenericConnection {
    close: () => Promise<void>
}