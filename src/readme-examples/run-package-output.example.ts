import {assert} from 'chai';
import {runPackageCli} from '../api/api';

describe('my CLI', () => {
    it('produces correct output', async () => {
        const cliOutputs = await runPackageCli({
            commandArgs: ['cliArg1'],
        });

        // assert that the command exited without any errors
        assert.strictEqual(cliOutputs.exitCode, 0);
    });
});
