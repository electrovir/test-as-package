import {replaceWithWindowsPathIfNeeded, runShellCommand} from '@augment-vir/node-js';
import {assert} from 'chai';
import {existsSync} from 'fs';
import {unlink} from 'fs/promises';
import {join} from 'path';
import {testRepoDirPaths} from '../test-file-paths.test-helper';
import {packPackage} from './pack-package';
import {installTar, uninstallSelf} from './package-installation';
import {getPackageName} from './package-name';

describe('package-installation', () => {
    async function testTarInstallation(repoDirPath: string) {
        const packageName = await getPackageName(repoDirPath);

        function checkNodeModules(shouldExist: boolean) {
            const moduleInstallationPath = join(
                repoDirPath,
                'node_modules',
                replaceWithWindowsPathIfNeeded(packageName),
            );
            if (shouldExist) {
                assert.isTrue(
                    existsSync(moduleInstallationPath),
                    `package installation path was not found for '${moduleInstallationPath}'`,
                );
            } else {
                assert.isFalse(
                    existsSync(moduleInstallationPath),
                    `package installation path was not removed for '${moduleInstallationPath}'`,
                );
            }
        }

        try {
            const packageTarPath = await packPackage(repoDirPath);

            await installTar({tarPath: packageTarPath, repoDirPath});
            assert.isFalse(existsSync(join(repoDirPath, 'package-lock.json')));

            checkNodeModules(true);
        } catch (error) {
        } finally {
            await uninstallSelf(repoDirPath);
            assert.isFalse(existsSync(join(repoDirPath, 'package-lock.json')));
            checkNodeModules(false);
        }
    }

    it('installs and uninstalls the tar file', async () => {
        await testTarInstallation(testRepoDirPaths.fakePackage);
    });

    it('installs and uninstalls scoped package tar files', async () => {
        await testTarInstallation(testRepoDirPaths.scopedFakePackage);
    });
});

async function checkIfSelfIsInstalled(dirPath: string) {
    const packageName = await getPackageName(dirPath);
    const output = await runShellCommand(`npm ls ${packageName}`, {
        cwd: dirPath,
        rejectOnError: true,
    });

    return !output.stdout.includes('empty');
}

describe(uninstallSelf.name, () => {
    it('does not uninstall if the package actually depends on itself', async () => {
        try {
            // ensure its node_modules has been populated
            await runShellCommand(`npm pack && npm i`, {
                cwd: testRepoDirPaths.selfDependent,
                rejectOnError: true,
            });
            const wasInstalledBefore = await checkIfSelfIsInstalled(testRepoDirPaths.selfDependent);
            await uninstallSelf(testRepoDirPaths.selfDependent);
            const isInstalledAfter = await checkIfSelfIsInstalled(testRepoDirPaths.selfDependent);

            assert.isTrue(
                wasInstalledBefore,
                'self should have been installed the beginning of the test',
            );
            assert.isTrue(
                isInstalledAfter,
                'self should have been installed still at the end of the test',
            );
        } finally {
            await unlink(join(testRepoDirPaths.selfDependent, 'package-lock.json'));
        }
    });
});
