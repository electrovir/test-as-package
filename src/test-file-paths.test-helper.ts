import {dirname, join} from 'path';

export const repoRootDirPath = dirname(dirname(__filename));

const testFilesDirPath = join(repoRootDirPath, 'test-files');

export const testRepoDirPaths = {
    fakePackage: join(testFilesDirPath, 'fake-package'),
    scopedFakePackage: join(testFilesDirPath, 'scoped-fake-package'),
    multipleBinsFakePackage: join(testFilesDirPath, 'multiple-bins-fake-package'),
    fullPackage: join(testFilesDirPath, 'full-package'),
};
