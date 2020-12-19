import {Platform} from "../../Platform";

// @ts-ignore
import Identifier from "@dashevo/dpp/lib/Identifier";

declare type ContractIdentifier = string | Identifier;

/**
 * Get contracts from the platform
 *
 * @param {Platform} this - bound instance class
 * @param {ContractIdentifier} identifier - identifier of the contract to fetch
 * @returns contracts
 */
export async function get(this: Platform, identifier: ContractIdentifier): Promise<any> {
    let localContract;

    const contractId : Identifier = Identifier.from(identifier);

    localContract = this.client.getApps().get(contractId);

    if (localContract && localContract.contract) {
        return localContract.contract;
    } else {
        // @ts-ignore
        const rawContract = await this.client.getDAPIClient().platform.getDataContract(contractId);

        if (!rawContract) {
            return null;
        }

        const contract = await this.dpp.dataContract.createFromBuffer(rawContract);

        this.client.getApps().set(contractId, {
            contract,
        });

        return contract;
    }
}

export default get;
