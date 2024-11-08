import {dirname, join} from 'node:path';

export const repoRootDirPath = dirname(dirname(import.meta.filename));

const testFilesDirPath = join(repoRootDirPath, 'test-files');

export const testRepoDirPaths = {
    fakePackage: join(testFilesDirPath, 'fake-package'),
    scopedFakePackage: join(testFilesDirPath, 'scoped-fake-package'),
    multipleBinsFakePackage: join(testFilesDirPath, 'multiple-bins-fake-package'),
    fullPackage: join(testFilesDirPath, 'full-package'),
    selfDependent: join(testFilesDirPath, 'full-package-that-depends-on-itself'),
};
