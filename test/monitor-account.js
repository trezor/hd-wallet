/* global it:false, describe:false, WebAssembly:true */

import { MockBitcore } from './_mock-bitcore';
import { WorkerDiscovery } from '../src/discovery/worker-discovery';
import fixtures from './fixtures/monitor-account.json';

import { discoveryWorkerFactory, xpubWorker, xpubFilePromise } from './_worker-helper';

const hasWasm = typeof WebAssembly !== 'undefined';
if (hasWasm) {
    monitorAccount(true);
}
monitorAccount(false);

function monitorAccount(enableWebassembly) {
    const desc = enableWebassembly ? ' wasm' : ' no wasm';
    describe(`monitor account${desc}`, () => {
        fixtures.forEach((fixture_orig) => {
            const fixture = JSON.parse(JSON.stringify(fixture_orig));
            it(fixture.name, function (done_orig) {
                this.timeout(30 * 1000);
                let wasm_old;
                if (!enableWebassembly && hasWasm) {
                    wasm_old = WebAssembly;
                    WebAssembly = undefined;
                }
                const spec = fixture.spec;
                const done_wasm = (x) => {
                    if (!enableWebassembly && hasWasm) {
                        WebAssembly = wasm_old;
                    }
                    done_orig(x);
                };
                const blockchain = new MockBitcore(spec, done_wasm);
                const discovery = new WorkerDiscovery(discoveryWorkerFactory, xpubWorker, xpubFilePromise, blockchain);
                const stream = discovery.monitorAccountActivity(
                    fixture.start,
                    fixture.xpub,
                    fixture.network,
                    fixture.segwit,
                    fixture.cashaddr,
                    fixture.gap,
                    fixture.timeOffset,
                );
                const done = (x) => {
                    stream.dispose();
                    done_wasm(x);
                };

                stream.values.attach((res) => {
                    if (!(res instanceof Error)) {
                        if (!blockchain.errored) {
                            if (JSON.stringify(res) !== JSON.stringify(fixture.end)) {
                                console.log('Discovery result', JSON.stringify(res, null, 2));
                                console.log('Fixture', JSON.stringify(fixture.end, null, 2));
                                done(new Error('Result not the same'));
                            } else if (blockchain.spec.length > 0) {
                                console.log(JSON.stringify(blockchain.spec));
                                done(new Error('Some spec left on end'));
                            } else {
                                done();
                            }
                        }
                    } else {
                        const err = res.message;
                        if (!(err.startsWith(fixture.endError))) {
                            console.log('Discovery result', JSON.stringify(err, null, 2));
                            console.log('Fixture', JSON.stringify(fixture.endError, null, 2));
                            done(new Error('Result not the same'));
                        } else if (blockchain.spec.length > 0) {
                            console.log(JSON.stringify(blockchain.spec));
                            done(new Error('Some spec left on end'));
                        } else {
                            done();
                        }
                    }
                });
            });
        });
    });
}