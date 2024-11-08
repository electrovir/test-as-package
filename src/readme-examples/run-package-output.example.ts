import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {runPackageCli} from '../index.js';

describe('my CLI', () => {
    it('produces correct output', async () => {
        const cliOutputs = await runPackageCli({
            commandArgs: ['cliArg1'],
        });

        // assert that the command exited without any errors
        assert.strictEquals(cliOutputs.exitCode, 0);
    });
});
