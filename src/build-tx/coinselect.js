/* @flow */

// this is converting in/to coinselect format
//
// I am using the coinselect format, since the end-goal is
// to merge the changes back to upstream; it didn't work out so far
import type {
    Network as BitcoinJsNetwork,
} from '@trezor/utxo-lib';
import {
    address as BitcoinJsAddress,
} from '@trezor/utxo-lib';
import BigNumber from 'bignumber.js';
import bitcoinJsSplit from './coinselect-lib/outputs/split';
import bitcoinJsCoinselect from './coinselect-lib';
import { transactionBytes, finalize } from './coinselect-lib/utils';


import type { UtxoInfo } from '../discovery';
import * as request from './request';
import { convertCashAddress } from '../utils/bchaddr';

const SEGWIT_INPUT_SCRIPT_LENGTH = 51; // actually 50.25, but let's make extra room
const INPUT_SCRIPT_LENGTH = 109;
const P2PKH_OUTPUT_SCRIPT_LENGTH = 25;
const P2SH_OUTPUT_SCRIPT_LENGTH = 23;
const P2WPKH_OUTPUT_SCRIPT_LENGTH = 22;
const P2WSH_OUTPUT_SCRIPT_LENGTH = 34;

export type Input = {
    id: number,
    script: {
        length: number,
    },
    value: string,

    own: boolean,
    coinbase: boolean,
    confirmations: number,
}

type OutputIn = {
    value?: string,
    script: {
        length: number,
    },
}

export type OutputOut = {
    value: string,
    script?: {
        length: number,
    },
}

export type CompleteResult = {
    type: 'true',
    result: {
        inputs: Array<Input>,
        outputs: Array<OutputOut>,
        max: string,
        totalSpent: string,
        fee: string,
        feePerByte: string,
        bytes: number,
    },
}

export type Result = CompleteResult | {
    type: 'false',
}

export function coinselect(
    utxos: Array<UtxoInfo>,
    rOutputs: Array<request.OutputRequest>,
    height: number,
    feeRate: string,
    segwit: boolean,
    countMax: boolean,
    countMaxId: number,
    dustThreshold: number,
    network: BitcoinJsNetwork,
    baseFee?: number,
    floorBaseFee?: boolean,
    dustOutputFee?: number,
    skipUtxoSelection?: boolean,
): Result {
    const inputs = convertInputs(utxos, height, segwit);
    const outputs = convertOutputs(rOutputs, network);
    const options = {
        inputLength: segwit ? SEGWIT_INPUT_SCRIPT_LENGTH : INPUT_SCRIPT_LENGTH,
        changeOutputLength: segwit ? P2SH_OUTPUT_SCRIPT_LENGTH : P2PKH_OUTPUT_SCRIPT_LENGTH,
        dustThreshold,
        baseFee,
        floorBaseFee,
        dustOutputFee,
    };

    const algorithm = countMax ? bitcoinJsSplit : bitcoinJsCoinselect;
    // finalize using requested custom inputs or use coin select algorith
    const result = skipUtxoSelection != null && !countMax
        ? finalize(inputs, outputs, parseInt(feeRate, 10), options)
        : algorithm(inputs, outputs, feeRate, options);
    if (!result.inputs) {
        return {
            type: 'false',
        };
    }

    const { fee } = result;
    const max = countMaxId === -1 ? -1 : result.outputs[countMaxId].value;

    const totalSpent = (result.outputs
        .filter((output, i) => i !== rOutputs.length)
        .map(o => o.value)
        .reduce((a, b) => new BigNumber(a).plus(b), new BigNumber(0))
    ).plus(new BigNumber(result.fee));


    const allSize = transactionBytes(result.inputs, result.outputs);
    // javascript WTF: fee is a string, allSize is a number, therefore it's working
    const feePerByte = fee / allSize;

    return {
        type: 'true',
        result: {
            ...result,
            fee: result.fee.toString(),

            feePerByte: feePerByte.toString(),
            bytes: allSize,
            max,
            totalSpent: totalSpent.toString(),
        },
    };
}

function convertInputs(
    inputs: Array<UtxoInfo>,
    height: number,
    segwit: boolean,
): Array<Input> {
    const bytesPerInput = segwit ? SEGWIT_INPUT_SCRIPT_LENGTH : INPUT_SCRIPT_LENGTH;
    return inputs.map((input, i) => ({
        id: i,
        script: { length: bytesPerInput },
        value: input.value,
        own: input.own,
        coinbase: input.coinbase,
        confirmations: input.height == null
            ? 0
            : (1 + height - input.height),
    }));
}

function isBech32(address: string): boolean {
    try {
        BitcoinJsAddress.fromBech32(address);
        return true;
    } catch (e) {
        return false;
    }
}

function getScriptAddress(address: string, network: BitcoinJsNetwork): {length: number} {
    const bech = isBech32(address);
    let pubkeyhash;
    if (!bech) {
        const decoded = BitcoinJsAddress.fromBase58Check(convertCashAddress(address));
        pubkeyhash = decoded.version === network.pubKeyHash;
    } else {
        const decoded = BitcoinJsAddress.fromBech32(address);
        pubkeyhash = decoded.data.length === 20;
    }

    const becLength = pubkeyhash ? P2WPKH_OUTPUT_SCRIPT_LENGTH : P2WSH_OUTPUT_SCRIPT_LENGTH;
    const norLength = pubkeyhash ? P2PKH_OUTPUT_SCRIPT_LENGTH : P2SH_OUTPUT_SCRIPT_LENGTH;
    const length = bech
        ? becLength
        : norLength;
    return { length };
}

function convertOutputs(
    outputs: Array<request.OutputRequest>,
    network: BitcoinJsNetwork,
): Array<OutputIn> {
    // most scripts are P2PKH; default is P2PKH
    const defaultScript = { length: P2PKH_OUTPUT_SCRIPT_LENGTH };
    return outputs.map((output) => {
        if (output.type === 'complete') {
            return {
                value: output.amount,
                script: getScriptAddress(output.address, network),
            };
        }
        if (output.type === 'noaddress') {
            return {
                value: output.amount,
                script: defaultScript,
            };
        }
        if (output.type === 'opreturn') {
            return {
                value: '0',
                script: { length: 2 + (output.dataHex.length / 2) },
            };
        }
        if (output.type === 'send-max') {
            return {
                script: getScriptAddress(output.address, network),
            };
        }
        if (output.type === 'send-max-noaddress') {
            return {
                script: defaultScript,
            };
        }
        throw new Error('WRONG-OUTPUT-TYPE');
    });
}
