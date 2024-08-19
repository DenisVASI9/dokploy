import { db } from "@/server/db";
import { compose } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";
import {
	extractBranchName,
	extractCommitMessage,
	extractHash,
} from "../[refreshToken]";
import {DeploymentJob} from "@/server/queues/lib/types";
import {client} from "@/server/queues/queueSetup";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const { refreshToken } = req.query;
	try {
		if (req.headers["x-github-event"] === "ping") {
			res.status(200).json({ message: "Ping received, webhook is active" });
			return;
		}
		const composeResult = await db.query.compose.findFirst({
			where: eq(compose.refreshToken, refreshToken as string),
			with: {
				project: true,
			},
		});

		if (!composeResult) {
			res.status(404).json({ message: "Compose Not Found" });
			return;
		}
		if (!composeResult?.autoDeploy) {
			res.status(400).json({
				message: "Automatic deployments are disabled for this compose",
			});
			return;
		}

		const deploymentTitle = extractCommitMessage(req.headers, req.body);
		const deploymentHash = extractHash(req.headers, req.body);
		const sourceType = composeResult.sourceType;

		if (sourceType === "github") {
			const branchName = extractBranchName(req.headers, req.body);
			if (!branchName || branchName !== composeResult.branch) {
				res.status(301).json({ message: "Branch Not Match" });
				return;
			}
		} else if (sourceType === "git") {
			const branchName = extractBranchName(req.headers, req.body);
			if (!branchName || branchName !== composeResult.customGitBranch) {
				res.status(301).json({ message: "Branch Not Match" });
				return;
			}
		}

		try {
			const jobData: DeploymentJob = {
				composeId: composeResult.composeId as string,
				titleLog: deploymentTitle,
				type: "deploy",
				applicationType: "compose",
				descriptionLog: `Hash: ${deploymentHash}`,
			};

			client.add(jobData);

		} catch (error) {
			res.status(400).json({ message: "Error To Deploy Compose", error });
			return;
		}

		res.status(200).json({ message: "Compose Deployed Succesfully" });
	} catch (error) {
		console.log(error);
		res.status(400).json({ message: "Error To Deploy Compose", error });
	}
}
