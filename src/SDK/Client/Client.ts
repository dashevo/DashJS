import {Wallet, Account} from "@dashevo/wallet-lib";
// FIXME: use dashcorelib types
import {Platform, PlatformOpts} from './Platform';
// @ts-ignore
import DAPIClient from "@dashevo/dapi-client"
import {Network, Mnemonic} from "@dashevo/dashcore-lib";
import isReady from "./methods/isReady";

/**
 * default seed passed to SDK options
 */
const defaultSeeds = [
    { service: 'seed-1.evonet.networks.dash.org' },
    { service: 'seed-2.evonet.networks.dash.org' },
    { service: 'seed-3.evonet.networks.dash.org' },
    { service: 'seed-4.evonet.networks.dash.org' },
    { service: 'seed-5.evonet.networks.dash.org' },
];


/**
 * Interface for DAPIClientSeed
 * @param {string} service - service seed, can be an IP, HTTP or DNS Seed
 */
export interface DAPIClientSeed {
    service: string,
}

/**
 * Interface Client Options
 *
 * @param {[string]?} [seeds] - wallet seeds
 * @param {Network? | string?} [network] - evonet network
 * @param {Mnemonic? | string? | null?} [mnemonic] - mnemonic passphrase
 * @param {ClientApps?} [apps] - applications
 * @param {number?} [accountIndex] - account index number
 */
export interface ClientOpts {
    seeds?: DAPIClientSeed[];
    network?: Network | string,
    wallet?: Wallet.Options | null,
    apps?: ClientApps,
    accountIndex?: number,
}

/**
 * Defined Type for ClientDependency
 */
export type ClientDependency = DAPIClient | any;

/**
 * Interface for ClientDependencies
 * @typeparam ClientDependencies object or DAPIClient
 */
export interface ClientDependencies {
    [name: string]: ClientDependency,
}

/**
 * Interface for ClientApps
 */
export interface ClientApps {
    [name: string]: {
        contractId: string,
    }
}

/**
 * class for SDK
 */
export class Client {
    public network: string = 'testnet';
    public wallet: Wallet | undefined;
    public account: Account | undefined;
    public platform: Platform | undefined;
    public accountIndex: number = 0;
    private readonly clients: ClientDependencies;
    private readonly apps: ClientApps;
    public state: {
        isAccountWaiting: boolean;
        isReady: boolean,
        isAccountReady: boolean
    };
    public isReady: Function;

    /**
     * Construct some instance of SDK Client
     *
     * @param {opts} ClientOpts - options for SDK Client
     */
    constructor(opts: ClientOpts = {}) {
        this.isReady = isReady.bind(this);

        this.network = (opts.network !== undefined) ? opts.network.toString() : 'testnet';
        this.apps = Object.assign({
            dpns: {
                contractId: '7PBvxeGpj7SsWfvDSa31uqEMt58LAiJww7zNcVRP1uEM'
            }
        }, opts.apps);

        this.state = {
            isReady: false,
            isAccountWaiting: false,
            isAccountReady: false
        };
        const seeds = (opts.seeds) ? opts.seeds : defaultSeeds;

        this.clients = {
            dapi: new DAPIClient({
                seeds: seeds,
                timeout: 1000,
                retries: 5,
                network: this.network
            })
        };

        // We accept null as parameter for a new generated mnemonic
        if (opts.wallet !== undefined) {
            this.wallet = new Wallet({
                transporter: {
                    seeds: seeds,
                    timeout: 1000,
                    retries: 5,
                    network: this.network,
                    type: 'dapi',
                },
                ...opts.wallet,
            });
            const self = this;
            let accountIndex = (opts.accountIndex !== undefined) ? opts.accountIndex : 0;
            self.state.isAccountWaiting = true;
            //@ts-ignore
            self.wallet
                .getAccount({index: accountIndex})
                .then((account) => {
                    self.account = account;
                    self.state.isAccountWaiting = false;
                    self.state.isAccountReady = true;
                })
        }

        let platformOpts: PlatformOpts = {
            client: this.getDAPIInstance(),
            apps: this.getApps()
        };

        this.platform = new Platform({
            ...platformOpts,
            network: this.network,
            account: this.account,
        })

    }

    /**
     * disconnect wallet from Dapi
     */
    async disconnect() {
        if (this.wallet) {
            await this.wallet.disconnect();
        }
    }

    /**
     * fetch some instance of DAPI client
     *
     * @remarks
     * This function throws an error message when there is no client DAPI instance
     *
     * @returns DAPI client instance
     */
    getDAPIInstance() {
        if (this.clients['dapi'] == undefined) {
            throw new Error(`There is no client DAPI`);
        }
        return this.clients['dapi'];
    }

    /**
     * fetch list of applications
     *
     * @remarks
     * check if returned value can be null on devnet
     *
     * @returns applications list
     */
    getApps(): ClientApps {
        return this.apps;
    }
}

export default Client;
