import {Platform} from "../../Platform";

/**
 * Broadcast document onto the platform
 * 
 * @param {Platform} this - bound instance class
 * @param document - document
 * @param identity - identity
 */
export async function broadcast(this: Platform, document: any, identity: any): Promise<any> {
    const {account, client, dpp} = this;

    // @ts-ignore
    const identityHDPrivateKey = account.getIdentityHDKey(0, 'user');

    // @ts-ignore
    const identityPrivateKey = identityHDPrivateKey.privateKey;

    const stateTransition = dpp.document.createStateTransition([document]);
    stateTransition.sign(identity.getPublicKeyById(1), identityPrivateKey);

    // @ts-ignore
    await client.applyStateTransition(stateTransition);

}

export default broadcast;
