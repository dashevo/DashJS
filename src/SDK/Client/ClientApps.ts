import Identifier from "@dashevo/dpp/lib/Identifier";

/**
 * Interface for ClientApps
 */

export interface ClientAppDefinitionOptions {
    contractId: Identifier | string,
    contract?: any
    aliases?: [string],
    alias?: string
};

export interface ClientAppDefinition {
    contractId: Identifier,
    contract: any,
    aliases: [string]
}

type ClientAppsList = Record<Identifier, ClientAppDefinition>;

function getIdentifierFromQuery(query: string|Identifier, apps: ClientAppsList): Identifier{
    let identifier;
    try {
        identifier = Identifier.from(query);
    } catch (e) {
        if(e.message !== 'Non-base58 character') throw e;
        const appSearch = Object.entries(apps).find((el) => {
            if (el[1].aliases.includes(query)) {
                return el;
            }
        });
        if (appSearch && appSearch.length) {
            identifier = Identifier.from(appSearch[0]);
        }
    }
    return identifier;
};

export class ClientApps {
    private apps: ClientAppsList = {};

    constructor(apps: Array<ClientAppDefinitionOptions> = []) {
        apps && apps.forEach((appDefinition)=> this.set(appDefinition.contractId, appDefinition));
    }

    getApps(){
        return this.apps;
    }
    /**
     * Set app
     *
     * @param {string|Identifier} contractId
     * @param {ClientAppDefinitionOptions} appProperties
     */
    set(contractId: string | Identifier, appProperties) {
        const identifier = Identifier.from(contractId);

        const definition = this.apps[identifier] || {
            contractId: identifier.toString(),
            contract: null,
            aliases: []};

        if (appProperties.contract) definition.contract = appProperties.contract;
        if (appProperties.alias) {
            definition.aliases.push(appProperties.alias);
        }
        if (appProperties.aliases) definition.aliases.push(...appProperties.aliases);
        this.apps[Identifier.from(identifier)] = definition;
    }

    /**
     * Get app definition by name or identifier
     *
     * @param {string|Identifier} query
     * @return {ClientAppDefinition}
     */
    get(query: string | Identifier) {
        const identifier = getIdentifierFromQuery(query, this.getApps());
        return this.apps[identifier];
    }


    /**
     * Check if app is defined by name or identifier
     *
     * @param {string|Identifier} query
     * @return {boolean}
     */
    has(query: string | Identifier) {
        let identifier;
        try {
            identifier = Identifier.from(query);
            return Boolean(this.apps[identifier])
        } catch (e) {
            return this.getAliases().includes(query);
        }
    }

    /**
     * Get all apps
     *
     * @return {ClientAppsList}
     */
    getAliases(): Array<any> {
        return Object
            .entries(this.apps)
            .map(function (elem) {
                const [, definition] = elem;
                return definition.aliases;
            })
            .reduce((acc, val: any) => acc.concat(val), []);
    }

    /**
     * Get all apps
     *
     * @return {ClientAppsList}
     */
    getIdentifiers(): Array<Identifier> {
        return Object.keys(this.apps).map((el) => Identifier.from(el));
    }
};
