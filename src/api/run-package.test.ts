import {mapObjectValues} from '@augment-vir/common';
import {ShellOutput} from '@augment-vir/node-js';
import chai, {assert} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {expectationCases} from 'test-established-expectations';
import {cli} from '../cli/cli';
import {repoRootDirPath, testRepoDirPaths} from '../test-file-paths.test-helper';
import {runCurrentPackage} from './run-package';

function sanitizeOutput<OutputGeneric extends object>(output: OutputGeneric): OutputGeneric {
    return mapObjectValues(output, (key, value) => {
        if (typeof value === 'string') {
            return value.replace(repoRootDirPath, '.');
        } else {
            return value;
        }
    }) as OutputGeneric;
}

describe(runCurrentPackage.name, () => {
    it('errors if no env variables were set', async () => {
        chai.use(chaiAsPromised);
        await assert.isRejected(runCurrentPackage());
    });

    expectationCases(
        async (inputs: NonNullable<Parameters<typeof runCurrentPackage>[0]>) => {
            const envVariables = await cli(inputs.cwd, ['test-as-package']);
            Object.assign(process.env, envVariables);
            const packageRunOutput: Partial<ShellOutput> = await runCurrentPackage(inputs);

            delete packageRunOutput.error;

            const sanitizedOutput = sanitizeOutput({
                ...envVariables,
                ...packageRunOutput,
            });

            return sanitizedOutput;
        },
        {
            testKey: runCurrentPackage.name,
        },
        [
            {
                it: 'runs the package when args are not provided',
                input: {
                    cwd: testRepoDirPaths.fullPackage,
                },
            },
        ],
    );
});
