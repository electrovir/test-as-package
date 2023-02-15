import {FunctionTestCase, itCases} from '@augment-vir/chai';
import {describe} from 'mocha';
import {testRepoDirPaths} from '../test-file-paths.test-helper';
import {getPackageName} from './package-name';

describe(getPackageName.name, async () => {
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
