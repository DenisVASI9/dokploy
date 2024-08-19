import {deployApplication, rebuildApplication, updateApplicationStatus,} from "../api/services/application";
import {deployCompose, rebuildCompose, updateCompose,} from "../api/services/compose";
import {useDeploymentWorkers} from "@/server/queues/lib/worker";

export const makeDeploymentWorkers = () => {
	return useDeploymentWorkers(async (job) => {
		try {
			if (job.applicationType === "application") {
				await updateApplicationStatus(job.applicationId, "running");
				if (job.type === "redeploy") {
					await rebuildApplication({
						applicationId: job.applicationId,
						titleLog: job.titleLog,
						descriptionLog: job.descriptionLog,
					});
				} else if (job.type === "deploy") {
					await deployApplication({
						applicationId: job.applicationId,
						titleLog: job.titleLog,
						descriptionLog: job.descriptionLog,
					});
				}
			} else if (job.applicationType === "compose") {
				await updateCompose(job.composeId, {
					composeStatus: "running",
				});
				if (job.type === "deploy") {
					await deployCompose({
						composeId: job.composeId,
						titleLog: job.titleLog,
						descriptionLog: job.descriptionLog,
					});
				} else if (job.type === "redeploy") {
					await rebuildCompose({
						composeId: job.composeId,
						titleLog: job.titleLog,
						descriptionLog: job.descriptionLog,
					});
				}
			}
		} catch (error) {
			console.log("Error", error);
		}
	})
}

// TODO: old worker
// export const deploymentWorker = new Worker(
// 	"deployments",
// 	async (job: Job<DeploymentJob>) => {
// 		try {
// 			if (job.data.applicationType === "application") {
// 				await updateApplicationStatus(job.data.applicationId, "running");
// 				if (job.data.type === "redeploy") {
// 					await rebuildApplication({
// 						applicationId: job.data.applicationId,
// 						titleLog: job.data.titleLog,
// 						descriptionLog: job.data.descriptionLog,
// 					});
// 				} else if (job.data.type === "deploy") {
// 					await deployApplication({
// 						applicationId: job.data.applicationId,
// 						titleLog: job.data.titleLog,
// 						descriptionLog: job.data.descriptionLog,
// 					});
// 				}
// 			} else if (job.data.applicationType === "compose") {
// 				await updateCompose(job.data.composeId, {
// 					composeStatus: "running",
// 				});
// 				if (job.data.type === "deploy") {
// 					await deployCompose({
// 						composeId: job.data.composeId,
// 						titleLog: job.data.titleLog,
// 						descriptionLog: job.data.descriptionLog,
// 					});
// 				} else if (job.data.type === "redeploy") {
// 					await rebuildCompose({
// 						composeId: job.data.composeId,
// 						titleLog: job.data.titleLog,
// 						descriptionLog: job.data.descriptionLog,
// 					});
// 				}
// 			}
// 		} catch (error) {
// 			console.log("Error", error);
// 		}
// 	},
// 	{
// 		autorun: false,
// 		connection: redisConfig,
// 	},
// );

// export const cleanQueuesByApplication = async (applicationId: string) => {
// 	const jobs = await myQueue.getJobs(["waiting", "delayed"]);
//
// 	for (const job of jobs) {
// 		if (job?.data?.applicationId === applicationId) {
// 			await job.remove();
// 			console.log(`Removed job ${job.id} for application ${applicationId}`);
// 		}
// 	}
// };
//
// export const cleanQueuesByCompose = async (composeId: string) => {
// 	const jobs = await myQueue.getJobs(["waiting", "delayed"]);
//
// 	for (const job of jobs) {
// 		if (job?.data?.composeId === composeId) {
// 			await job.remove();
// 			console.log(`Removed job ${job.id} for compose ${composeId}`);
// 		}
// 	}
// };
