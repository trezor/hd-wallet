import {address as baddress, HDNode, networks} from 'bitcoinjs-lib-zcash';

import {WorkerChannel} from '../lib/utils/simple-worker-channel';
import {WorkerAddressSource, PrefatchingSource, CachingSource} from '../lib/address-source';
import {WorkerDiscovery} from '../lib/discovery/worker-discovery';
import {BitcoreBlockchain} from '../lib/bitcore';

import h from 'virtual-dom/h';
import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import createElement from 'virtual-dom/create-element';

// setting up workers
const cryptoWorker = new Worker('./trezor-crypto.js');
const socketWorkerFactory = () => new Worker('./socket-worker.js');
const discoveryWorkerFactory = () => new Worker('./discovery-worker.js');

function renderTx(tx) {
    return h('tr', [
        h('td', tx.hash),
        h('td', tx.height ? tx.height.toString() : 'unconfirmed'),
        h('td', tx.value.toString()),
        h('td', tx.type),
        h('td', tx.targets.map((t) => h('span', `${t.address} (${t.value}) `)))
    ]);
}

function renderAccount(account) {
    if (typeof account.info === 'number') {
        return h('div', `${account.xpub} - Loading (${account.info} transactions)`);
    }
    return [h('div', `${account.xpub} - Balance: ${account.info.balance}`), h('table', account.info.transactions.map(renderTx))];
}

function render(state) {
    return h('div', state.map(renderAccount));
}

let appState = [];
let processes = [];
let tree = render(appState);
let rootNode = createElement(tree);

document.body.appendChild(rootNode);

function refresh() {
    var newTree = render(appState);
    var patches = diff(tree, newTree);
    rootNode = patch(rootNode, patches);
    tree = newTree;
}

let portfolio;

function discover(xpubs, discovery, network) {
    let index = 0;
    let done = 0;
    xpubs.forEach((xpub, i) => {
        let process = discovery.discoverAccount(null, xpub, network);
        appState[i] = {xpub, info: 0};
        
        process.stream.values.attach(status => {
            appState[i] = {xpub, info: status.transactions};
            refresh();
        });
        process.ending.then(info => {
            appState[i] = {xpub, info};
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
    const XPUBS = [
      "xpub6D7uLP7HT3SyiqwTViTgRcsA5y4xe8G7DEgfmXASXjBJYdKqFTUogA3tYyg5vV8W2wqsc5zMecaDmSYVc8dfV24Dkcsza15VwDvRAz8RAY1",
      "xpub6D7uLP7HT3SynZWYAxsJtU37QEzY4TMw5bcQteuXYo8RXcK5uWpkQmnK6LwsATFw6nC8YaXbBK12EgSde1LsFd5MXLx7uKV31oAFfkoNkGx",
      "xpub6D7uLP7HT3SykPeGqZi2FYLk7X2ZjAjBpzNB1fUJMWkV9DPVgk74dpDwfhxS6fUU3YFEuTJDcmh1yqLGX9yLwYkge2nugX5vnhcmcRjwqnv",
      "xpub6D7uLP7HT3Syp7z9rZBCpeaUq9d719eVij4yjBVzmFDD8TEYXKYNQuwDgfdPBcWZuU7GipXjztQu7wCECfhmEZTKcrRKU6h4jSjLqGYHr3B",
      "xpub6C5EN28c3cv4n92htaF2ttKTWS3BNy7VTj6dPKZ3iR6rKSC1GUfLA1ZSo1sE5YUThz9Jr2ZN2vfgNXBGX3o98PkDRCyAme7yNcf9kwZvYfC"
    ];

    const BITCORE_URLS = ['https://bitcore1.trezor.io', 'https://bitcore3.trezor.io'];

    let socketWorkerFactory = () => new Worker('./socket-worker.js');
    let discoveryWorkerFactory = () => new Worker('./discovery-worker.js');

    let blockchain = new BitcoreBlockchain(BITCORE_URLS, socketWorkerFactory);
    let cryptoChannel = new WorkerChannel(cryptoWorker);

    let discovery = new WorkerDiscovery(discoveryWorkerFactory, cryptoChannel, blockchain);
    let network = networks.bitcoin;
    discover(XPUBS, discovery, network);
};

window.stop = () => {
    processes.forEach(p => p.dispose());
    console.timeEnd('portfolio');
};
