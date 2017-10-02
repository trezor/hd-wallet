/* @flow */

import * as request from './request';
import * as result from './result';
import * as transaction from './transaction';
import * as coinselect from './coinselect';

export {empty as emptyResult} from './result';
export {Result as BuildTxResult} from './result';
export {Transaction as BuildTxTransaction} from './transaction';

export function buildTx(
    {utxos, outputs, height, feeRate, segwit, inputAmounts, basePath, network, changeId, changeAddress}: request.Request
): result.Result {
    const empty = request.isEmpty(utxos, outputs);
    let countMax = {exists: false, id: 0};
    try {
        countMax = request.getMax(outputs);
    } catch (e) {
        return {type: 'error', error: e.message};
    }
    const splitOutputs = request.splitByCompleteness(outputs);

    if (empty) {
        return result.empty;
    }

    let csResult: coinselect.Result = {type: 'false'};
    try {
        csResult = coinselect.coinselect(utxos, outputs, height, feeRate, segwit, countMax.exists, countMax.id);
    } catch (e) {
        return {type: 'error', error: e.message};
    }

    if (csResult.type === 'false') {
        return {type: 'error', error: 'NOT-ENOUGH-FUNDS'};
    } else {
        if (splitOutputs.incomplete.length > 0) {
            return result.getNonfinalResult(csResult);
        }

        const resTransaction = transaction.createTransaction(
            utxos,
            csResult.result.inputs,
            splitOutputs.complete,
            csResult.result.outputs,
            segwit,
            inputAmounts,
            basePath,
            changeId,
            changeAddress,
            network
        );
        return result.getFinalResult(csResult, resTransaction);
    }
}
