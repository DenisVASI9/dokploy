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
    NATS
}