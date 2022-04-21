import { Router } from "express";
import { GetRivalUsers, SetRivals } from "lib/rivals/rivals";
import prValidate from "server/middleware/prudence-validate";
import { GetUGPT } from "utils/req-tachi-data";
import { RequireAuthedAsUser, RequireSelfRequestFromUser } from "../../../../middleware";
import p from "prudence";
import { integer } from "tachi-common";

const router: Router = Router({ mergeParams: true });

/**
 * Returns all of this user's set rivals.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/rivals
 */
router.get("/", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const rivals = await GetRivalUsers(user.id, game, playtype);

	return res.status(200).json({
		success: true,
		description: `Returned ${rivals.length} rivals.`,
		body: rivals,
	});
});

/**
 * Sets the user's rivals for this GPT.
 *
 * @param rivalIDs - An array of rivalIDs to set as their rivals.
 *
 * @name PUT /api/v1/users/:userID/games/:game/:playtype/rivals
 */
router.put(
	"/",
	RequireAuthedAsUser,
	RequireSelfRequestFromUser,
	prValidate({
		rivalIDs: [p.isPositiveNonZeroInteger],
	}),
	async (req, res) => {
		const rivalIDs: integer[] = req.body.rivalIDs;
		const { user, game, playtype } = GetUGPT(req);

		if (rivalIDs.length > 5) {
			return res.status(400).json({
				success: false,
				description: `You can only set up to 5 rivals.`,
			});
		}

		await SetRivals(user.id, game, playtype, rivalIDs);

		return res.status(200).json({
			success: true,
			description: `Set ${rivalIDs.length} rivals.`,
			body: {},
		});
	}
);

export default router;
