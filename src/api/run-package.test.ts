import {mapObjectValues} from '@augment-vir/common';
import {ShellOutput} from '@augment-vir/node-js';
import chai, {assert} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {expectationCases} from 'test-established-expectations';
import {cli} from '../cli/cli';
import {repoRootDirPath, testRepoDirPaths} from '../test-file-paths.test-helper';
import {runCurrentPackageCli} from './run-package';

function sanitizeOutput<OutputGeneric extends object>(output: OutputGeneric): OutputGeneric {
    return mapObjectValues(output, (key, value) => {
        if (typeof value === 'string') {
            return value.replaceAll(repoRootDirPath, '.');
        } else {
            return value;
        }
    }) as OutputGeneric;
}

async function testRunCurrentPackageCli(
    inputs: NonNullable<Parameters<typeof runCurrentPackageCli>[0]>,
) {
    const envVariables = await cli(inputs.cwd, ['test-as-package']);
    Object.assign(process.env, envVariables);
    const packageRunOutput: Partial<ShellOutput> = await runCurrentPackageCli(inputs);

    delete packageRunOutput.error;

    const sanitizedOutput = sanitizeOutput({
        ...envVariables,
        ...packageRunOutput,
    });

    return sanitizedOutput;
}

describe(runCurrentPackageCli.name, () => {
    it('errors if no env variables were set', async () => {
        chai.use(chaiAsPromised);
        await assert.isRejected(runCurrentPackageCli());
    });

    expectationCases(
        testRunCurrentPackageCli,
        {
            testKey: runCurrentPackageCli.name,
        },
        [
            {
                it: 'runs the package when args are not provided',
                input: {
                    cwd: testRepoDirPaths.fullPackage,
                },
            },
            {
                it: 'runs with arguments',
                input: {
                    commandArgs: [
                        'hello',
                        'there',
                        'there are arguments',
                    ],
                    cwd: testRepoDirPaths.fullPackage,
                },
            },
            {
                it: 'returns errors',
                input: {
                    commandArgs: [
                        'throw error',
                        'this will',
                        'throw an error',
                    ],
                    cwd: testRepoDirPaths.fullPackage,
                },
            },
        ],
    );
});
