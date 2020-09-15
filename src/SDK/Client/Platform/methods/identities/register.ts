import { Platform } from "../../Platform";
import { wait } from "../../../../../utils/wait";
import createAssetLockTransaction from "../../createAssetLockTransaction";
import {PrivateKey} from "@dashevo/dashcore-lib";

/**
 * Register identities to the platform
 *
 * @param {number} [fundingAmount=10000] - funding amount in duffs
 * @returns {Identity} identity - a register and funded identity
 */
export default async function register(this: Platform, fundingAmount : number = 10000): Promise<any> {
    const { client, dpp } = this;

    const account = await client.getWalletAccount();
    // @ts-ignore
    const assetLockOneTimePrivateKey = new PrivateKey();

    const assetLockTransaction = await createAssetLockTransaction(this, assetLockOneTimePrivateKey, fundingAmount);

    // Broadcast Asset Lock transaction
    await account.broadcastTransaction(assetLockTransaction);

    // Wait some time for propagation
    await wait(1000);

    // Create Identity
    const assetLockOutPoint = assetLockTransaction.getOutPointBuffer(0);

    const identityIndex = await account.getUnusedIdentityIndex();

    // @ts-ignore
    const { privateKey: identityPrivateKey } = account.getIdentityHDKeyByIndex(identityIndex, 0);
    const identityPublicKey = identityPrivateKey.toPublicKey();

    const identity = dpp.identity.create(assetLockOutPoint, [identityPublicKey]);

    // Create ST
    const identityCreateTransition = dpp.identity.createIdentityCreateTransition(identity);

    identityCreateTransition.signByPrivateKey(assetLockOneTimePrivateKey);

    const result = await dpp.stateTransition.validateStructure(identityCreateTransition);

    if (!result.isValid()) {
        throw new Error(`StateTransition is invalid - ${JSON.stringify(result.getErrors())}`);
    }

    // Broadcast ST
    await client.getDAPIClient().platform.broadcastStateTransition(identityCreateTransition.serialize());

    account.storage.insertIdentityIdAtIndex(
        account.walletId,
        identity.getId(),
        identityIndex,
    );

    // Wait some time for propagation
    await wait(1000);

    return identity;
}
