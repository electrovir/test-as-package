import {assert} from '@augment-vir/assert';
import {mapObjectValues, wrapInTry} from '@augment-vir/common';
import {ShellOutput, toPosixPath} from '@augment-vir/node';
import {describe, it, snapshotCases} from '@augment-vir/test';
import {cli} from '../cli/cli.js';
import {repoRootDirPath, testRepoDirPaths} from '../test-file-paths.test-helper.js';
import {runPackageCli} from './run-package.js';

function sanitizeOutput<OutputGeneric extends object>(output: OutputGeneric): OutputGeneric {
    return mapObjectValues(output, (key, value) => {
        if (typeof value === 'string') {
            const parsedValue: unknown = wrapInTry(() => JSON.parse(value), {
                fallbackValue: undefined,
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
        await assert.throws(() => runPackageCli());
    });

    snapshotCases(testRunCurrentPackageCli, [
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
    ]);
});
