import {mapObjectValues, parseJson} from '@augment-vir/common';
import {ShellOutput, toPosixPath} from '@augment-vir/node-js';
import chai, {assert} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {expectationCases} from 'test-established-expectations';
import {cli} from '../cli/cli';
import {repoRootDirPath, testRepoDirPaths} from '../test-file-paths.test-helper';
import {runPackageCli} from './run-package';

function sanitizeOutput<OutputGeneric extends object>(output: OutputGeneric): OutputGeneric {
    return mapObjectValues(output, (key, value) => {
        if (typeof value === 'string') {
            const parsedValue = parseJson<string | undefined>({
                jsonString: value,
                errorHandler: () => {
                    return undefined;
                },
            });
            if (typeof parsedValue === 'string' && parsedValue) {
                return JSON.stringify(
                    toPosixPath(parsedValue).replaceAll(toPosixPath(repoRootDirPath), '.'),
                );
            }
        }
        return value;
    }) as OutputGeneric;
}

async function testRunCurrentPackageCli(inputs: NonNullable<Parameters<typeof runPackageCli>[0]>) {
    const envVariables = await cli({
        args: ['test-as-package'],
        cwd: inputs.cwd,
        skipUninstall: true,
    });
    Object.assign(process.env, envVariables);
    const packageRunOutput: Partial<ShellOutput> = await runPackageCli(inputs);

    delete packageRunOutput.error;

    const sanitizedOutput = sanitizeOutput({
        ...envVariables,
        ...packageRunOutput,
    });

    return sanitizedOutput;
}

describe(runPackageCli.name, () => {
    it('errors if no env variables were set', async () => {
        chai.use(chaiAsPromised);
        await assert.isRejected(runPackageCli());
    });

    expectationCases(
        testRunCurrentPackageCli,
        {
            testKey: runPackageCli.name,
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
