/* global Worker:false, fetch:false, window:false, document:false */
import { networks } from 'trezor-utxo-lib';


// eslint-disable-next-line import/no-extraneous-dependencies
import h from 'virtual-dom/h';
// eslint-disable-next-line import/no-extraneous-dependencies
import diff from 'virtual-dom/diff';
// eslint-disable-next-line import/no-extraneous-dependencies
import patch from 'virtual-dom/patch';
// eslint-disable-next-line import/no-extraneous-dependencies
import createElement from 'virtual-dom/create-element';
import { BitcoreBlockchain } from '../src/bitcore';
import { WorkerDiscovery } from '../src/discovery/worker-discovery';

// setting up workers
const fastXpubWorker = new Worker('fastxpub.js');
const fastXpubWasmFilePromise = fetch('fastxpub.wasm')
    .then(response => (response.ok ? response.arrayBuffer() : Promise.reject(new Error('failed to load'))));

const socketWorkerFactory = () => new Worker('./socket-worker.js');
const discoveryWorkerFactory = () => new Worker('./discovery-worker.js');

function renderTx(tx) {
    const className = tx.invalidTransaction ? 'invalid' : 'valid';
    return h('tr', { className }, [
        h('td', tx.hash),
        h('td', tx.height ? tx.height.toString() : 'unconfirmed'),
        h('td', tx.value.toString()),
        h('td', tx.type),
        h('td', tx.targets.map(t => h('span', `${t.address} (${t.value}) `))),
    ]);
}

function renderAccount(account) {
    if (typeof account.info === 'number') {
        return [
            h('h3', `${account.xpub}`),
            h('div', `Loading ${account.info} transactions)`),
        ];
    }
    return [
        h('h3', `${account.xpub}`),
        h('div', `Balance: ${account.info.balance}`),
        h('table', account.info.transactions.map(renderTx)),
    ];
}

function render(state) {
    return h('div', state.map(renderAccount));
}

const appState = [];
const processes = [];
let tree = render(appState);
let rootNode = createElement(tree);

document.body.appendChild(rootNode);

function refresh() {
    const newTree = render(appState);
    const patches = diff(tree, newTree);
    rootNode = patch(rootNode, patches);
    tree = newTree;
}

function discover(xpubs, discovery, network, segwit, cashaddr) {
    let done = 0;
    xpubs.forEach((xpub, i) => {
        const process = discovery.discoverAccount(null, xpub, network, segwit ? 'p2sh' : 'off', cashaddr, 20, 0);
        appState[i] = { xpub, info: 0 };

        process.stream.values.attach((status) => {
            appState[i] = { xpub, info: status.transactions };
            refresh();
        });
        process.ending.then((info) => {
            appState[i] = { xpub, info };
            refresh();
            done++;
            if (done === xpubs.length) {
                console.timeEnd('portfolio');
            }
        });
        processes.push(process);
        refresh();
    });
    console.time('portfolio');
}


window.run = () => {
    window.clear();
    const XPUBS = document.getElementById('xpubs').value.split(';');
    const BITCORE_URLS = document.getElementById('urls').value.split(';');
    const selected = document.getElementById('network').value;
    const d = window.data[selected];

    const blockchain = new BitcoreBlockchain(BITCORE_URLS, socketWorkerFactory, d.network);

    const discovery = new WorkerDiscovery(
        discoveryWorkerFactory,
        fastXpubWorker,
        fastXpubWasmFilePromise,
        blockchain,
    );
    const cashaddr = selected === 'bitcoincash';
    const segwit = selected.indexOf('Segwit') >= 0;
    discover(XPUBS, discovery, d.network, segwit, cashaddr);
};

window.stop = () => {
    processes.forEach(p => p.dispose());
    console.timeEnd('portfolio');
};

window.clear = () => {
    appState.splice(0, appState.length);
    refresh();
};
