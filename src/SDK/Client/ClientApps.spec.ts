import Identifier from "@dashevo/dpp/lib/Identifier";
import {expect} from 'chai';
import {ClientApps} from "./ClientApps";
import 'mocha';
import exp from "constants";

describe('ClientApps', () => {
    let apps;
    it('constructor', function () {
        apps = new ClientApps();
        expect(apps.apps).to.deep.equal({});

        const appsFromProps = new ClientApps([{
            contractId: '3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8',
            contract: null,
            aliases: ['dpns']
        }
        ]);

        expect(appsFromProps.getApps()).to.deep.equal({
            "3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8": {
                contractId: '3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8',
                contract: null,
                aliases: ['dpns']
            }
        })
    });
    it('.set', function () {
        apps.set('3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8', {
            alias: 'dpns'
        });
        expect(apps.getApps()['3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8']).to.deep.equal({
            "contractId": "3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8",
            "contract": null,
            "aliases": ["dpns"],
        });

        apps.set('3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8', {
            contract: {something: true},
            aliases: ['tutorialContract', 'contract']
        });
        expect(apps.getApps()['3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8']).to.deep.equal({
            "contractId": "3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8",
            "contract": {something: true},
            "aliases": ["dpns", "tutorialContract", "contract"],
        });
        expect(apps.getApps()['3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8']).to.deep.equal({
            "contractId": "3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8",
            "contract": {something: true},
            "aliases": ["dpns", "tutorialContract", "contract"],
        });
        apps.set('3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u9', {
            alias: 'dpns',
            contract: {somethingElse: true}
        });
        expect(apps.getApps()).to.deep.equal({"3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8": {
            "contractId": "3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8",
            "contract": {something: true},
            "aliases": ["tutorialContract", "contract"],
        }, "3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u9":{
            "contractId": "3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u9",
            "contract": {somethingElse: true},
            "aliases": ["dpns"],
        }});

    });
    it('should get', function () {
        const getByIdentifier = apps.get('3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8');
        expect(getByIdentifier).to.deep.equal({
            "contractId": "3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8",
            "contract": {something: true},
            "aliases": ["tutorialContract", "contract"],
        })
        const getByAlias = apps.get('tutorialContract');
        expect(getByAlias).to.deep.equal({
            "contractId": "3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8",
            "contract": {something: true},
            "aliases": ["tutorialContract", "contract"],
        })
    });
    it('should .getIdentifiers()', function () {
        const identifiers = apps.getIdentifiers();
        expect(identifiers).to.deep.equal([
            Identifier.from('3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8'),
            Identifier.from('3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u9')
        ]);
    });
    it('should .getAliases()', function () {
        const aliases = apps.getAliases();
        expect(aliases).to.deep.equal(['tutorialContract', 'contract', 'dpns']);
    });
    it('should .has', function () {
        expect(apps.has('3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8')).to.equal(true);
        expect(apps.has(Identifier.from('3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u8'))).to.equal(true);
        expect(apps.has('tutorialContract')).to.equal(true);
        expect(apps.has('dpns')).to.equal(true);
        expect(apps.has('3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u9')).to.equal(true);

        expect(apps.has('3VvS19qomuGSbEYWbTsRzeuRgawU3yK4fPMzLrbV62u1')).to.equal(false);
        expect(apps.has('tutorialContractt')).to.equal(false);
    });
});


