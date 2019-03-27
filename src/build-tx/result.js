/* @flow */

import * as mtransaction from './transaction';
import * as coinselect from './coinselect';

// ---------- Output from algorigthm
// 'nonfinal' - contains info about the outputs, but not Trezor tx
// 'final' - contains info about outputs + Trezor tx
// 'error' - some error, so far only NOT-ENOUGH-FUNDS and EMPTY strings
export type Result = {
    type: 'error',
    error: string,
} | {
    type: 'nonfinal',
    max: string,
    totalSpent: string, // all the outputs, no fee, no change
    fee: string,
    feePerByte: string,
    bytes: number,
} | {
    type: 'final',
    max: string,
    totalSpent: string, // all the outputs, no fee, no change
    fee: string,
    feePerByte: string,
    bytes: number,
    transaction: mtransaction.Transaction,
};

export const empty: Result = {
    type: 'error',
    error: 'EMPTY',
};

export function getNonfinalResult(result: coinselect.CompleteResult): Result {
    const {
        max, fee, feePerByte, bytes, totalSpent,
    } = result.result;

    return {
        type: 'nonfinal',
        fee,
        feePerByte,
        bytes,
        max,
        totalSpent,
    };
}

export function getFinalResult(
    result: coinselect.CompleteResult,
    transaction: mtransaction.Transaction,
): Result {
    const {
        max, fee, feePerByte, bytes, totalSpent,
    } = result.result;

    return {
        type: 'final',
        fee,
        feePerByte,
        bytes,
        transaction,
        max,
        totalSpent,
    };
}
