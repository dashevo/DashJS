import crypto from "crypto";
import { Platform } from "./Platform";
import { StateTransitionBroadcastError } from "../../../errors/StateTransitionBroadcastError";
import { IStateTransitionResult } from "./IStateTransitionResult";
import { IPlatformStateProof } from "./IPlatformStateProof";

/**
 * @param {Platform} platform
 * @param stateTransition
 */
export default async function broadcastStateTransition(platform: Platform, stateTransition: any): Promise<IPlatformStateProof|void> {
    const { client, dpp } = platform;

    console.log('validating structure');
    const result = await dpp.stateTransition.validateStructure(stateTransition);

    if (!result.isValid()) {
        throw new Error(`StateTransition is invalid - ${JSON.stringify(result.getErrors())}`);
    }

    console.log('Creating hash');
    // Subscribing to future result
    const hash = crypto.createHash('sha256')
      .update(stateTransition.toBuffer())
      .digest();

    console.log('state transition:');
    console.log(stateTransition.toBuffer().toString('hex'));
    // Broadcasting state transition

    const parsed = await dpp.stateTransition.createFromBuffer(stateTransition.toBuffer());
    console.log(parsed);
    console.log('Broadcasting transition');
    try {
        await client.getDAPIClient().platform.broadcastStateTransition(stateTransition.toBuffer());
    } catch (e) {
        let data;
        let message;

        if (e.data) {
            data = e.data;
        } else if (e.metadata) {
            if (typeof e.metadata.get === 'function') {
                const errors = e.metadata.get('errors');
                data = {};
                data.errors = errors && errors.length > 0 ? JSON.parse(errors) : errors;
            } else {
                data = e.metadata;
            }
        }

        if (e.details) {
            message = e.details;
        } else {
            message = e.message;
        }

        throw new StateTransitionBroadcastError(e.code, message, data);
    }

    // Waiting for result to return
    const stateTransitionResult: IStateTransitionResult = await client.getDAPIClient().platform.waitForStateTransitionResult(hash, { prove: true });

    let { error } = stateTransitionResult;

    if (error) {
        throw new StateTransitionBroadcastError(error.code, error.message, error.data);
    }

    return stateTransitionResult.proof;
}
