import {toPosixPath} from '@augment-vir/node';
import {describe, snapshotCases} from '@augment-vir/test';
import {packageBeingTestedInstallationBinDirPath} from '../package-being-tested-env-names.js';
import {repoRootDirPath, testRepoDirPaths} from '../test-file-paths.test-helper.js';
import {cli} from './cli.js';

function sanitizeOutput(output: Awaited<ReturnType<typeof cli>>): Awaited<ReturnType<typeof cli>> {
    return {
        ...output,
        [packageBeingTestedInstallationBinDirPath]: JSON.stringify(
            toPosixPath(JSON.parse(output[packageBeingTestedInstallationBinDirPath])).replaceAll(
                toPosixPath(repoRootDirPath),
                '.',
            ),
        ),
    };
}

async function testCli(cwd: NonNullable<Parameters<typeof cli>[0]>['cwd']) {
    const rawOutput = await cli({
        cwd,
        args: [
            'test-as-package',
        ],
        skipUninstall: true,
    });
    const sanitizedOutput = sanitizeOutput(rawOutput);
    return sanitizedOutput;
}

describe(cli.name, () => {
    snapshotCases(testCli, [
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
