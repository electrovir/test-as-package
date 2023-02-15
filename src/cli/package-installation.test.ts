import {replaceWithWindowsPathIfNeeded} from '@augment-vir/node-js';
import {assert} from 'chai';
import {existsSync} from 'fs';
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

            checkNodeModules(true);
        } catch (error) {
        } finally {
            await uninstallSelf(repoDirPath);

            checkNodeModules(false);
        }
    }

    it('installs and uninstalls the tar file', async () => {
        testTarInstallation(testRepoDirPaths.fakePackage);
    });

    it('installs and uninstalls scoped package tar files', async () => {
        testTarInstallation(testRepoDirPaths.scopedFakePackage);
    });
});
