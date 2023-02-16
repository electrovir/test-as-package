import {expectationCases} from 'test-established-expectations';
import {packageBeingTestedInstallationBinDirPath} from '../package-being-tested-env-names';
import {repoRootDirPath, testRepoDirPaths} from '../test-file-paths.test-helper';
import {cli} from './cli';

function sanitizeOutput(output: Awaited<ReturnType<typeof cli>>): Awaited<ReturnType<typeof cli>> {
    return {
        ...output,
        [packageBeingTestedInstallationBinDirPath]: output[
            packageBeingTestedInstallationBinDirPath
        ].replace(repoRootDirPath, '.'),
    };
}

async function testCli(input: Parameters<typeof cli>[0]) {
    const rawOutput = await cli(input, ['test-as-package']);
    const sanitizedOutput = sanitizeOutput(rawOutput);
    return sanitizedOutput;
}

describe(cli.name, () => {
    expectationCases(testCli, [
        {
            it: 'sets env variables',
            input: testRepoDirPaths.fakePackage,
        },
        {
            it: 'sets multiple bin env variables',
            input: testRepoDirPaths.multipleBinsFakePackage,
        },
        {
            it: "sets full package's env variables",
            input: testRepoDirPaths.fullPackage,
        },
    ]);
});
