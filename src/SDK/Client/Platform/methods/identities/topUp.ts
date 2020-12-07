// @ts-ignore
import Identifier from "@dashevo/dpp/lib/Identifier";
import {Platform} from "../../Platform";

import { wait } from "../../../../../utils/wait";
import createAssetLockTransaction from "../../createAssetLockTransaction";

/**
 * Register identities to the platform
 *
 * @param {Platform} this - bound instance class
 * @param {Identifier|string} identityId - id of the identity to top up
 * @param {number} amount - amount to top up in duffs
 * @returns {boolean}
 */
export async function topUp(this: Platform, identityId: Identifier | string, amount: number): Promise<any> {
    const { client, dpp } = this;

    identityId = Identifier.from(identityId);

    const account = await client.getWalletAccount();

    const {
        transaction: assetLockTransaction,
        privateKey: assetLockPrivateKey
    } = await createAssetLockTransaction(this, amount);

    // Broadcast Asset Lock transaction
    await account.broadcastTransaction(assetLockTransaction);

    // Wait some time for propagation
    await wait(1000);

    // Create ST
    // Get IS lock to proof that transaction won't be double spent
    const instantLock = await account.waitForInstantLock(assetLockTransaction.hash);
    // @ts-ignore
    const assetLockProof = await dpp.identity.createInstantAssetLockProof(instantLock);
    // @ts-ignore
    const identityTopUpTransition = dpp.identity.createIdentityTopUpTransition(identityId, assetLockTransaction, 0, assetLockProof);

    identityTopUpTransition.signByPrivateKey(assetLockPrivateKey);

    const result = await dpp.stateTransition.validateStructure(identityTopUpTransition);

    if (!result.isValid()) {
        throw new Error(`StateTransition is invalid - ${JSON.stringify(result.getErrors())}`);
    }

    // Broadcast ST

    await client.getDAPIClient().platform.broadcastStateTransition(identityTopUpTransition.toBuffer());

    // Wait some time for propagation
    await wait(1000);

    return true;
}

export default topUp;
