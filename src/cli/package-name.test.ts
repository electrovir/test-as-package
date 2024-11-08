import {describe, itCases, type FunctionTestCase} from '@augment-vir/test';
import {testRepoDirPaths} from '../test-file-paths.test-helper.js';
import {getPackageName} from './package-name.js';

describe(getPackageName.name, () => {
    describe('should produce correct outputs for', () => {
        itCases(
            getPackageName,
            [
                {
                    dirPath: '.',
                    expectedName: 'test-as-package',
                },
                {
                    dirPath: testRepoDirPaths.fakePackage,
                    expectedName: 'fake-package',
                },
                {
                    dirPath: testRepoDirPaths.scopedFakePackage,
                    expectedName: '@electrovir/scoped-fake-package',
                },
            ].map((entry): FunctionTestCase<typeof getPackageName> => {
                return {
                    it: entry.expectedName,
                    expect: entry.expectedName,
                    input: entry.dirPath,
                };
            }),
        );
    });
});
