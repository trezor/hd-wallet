// I am using coinselect like this; the end-goal is, however, to merge all the changes
// back into the upstream and use coinselect from npm

import accumulative from './inputs/accumulative';
import bnb from './inputs/bnb';
import * as sorts from './sorts';
import * as utils from './utils';
import tryConfirmed from './tryconfirmed';

export default function coinSelect(inputs, outputs, feeRate, options) {
    const sortedInputs = options.skipPermutation ? inputs : inputs.sort(sorts.score(feeRate));

    const algorithm = tryConfirmed(
        utils.anyOf([bnb(0.5), accumulative]),
        options,
    );

    return algorithm(sortedInputs, outputs, feeRate, options);
}
