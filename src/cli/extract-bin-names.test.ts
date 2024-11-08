import {describe, itCases} from '@augment-vir/test';
import {testRepoDirPaths} from '../test-file-paths.test-helper.js';
import {extractBinNames} from './extract-bin-names.js';

describe(extractBinNames.name, () => {
    itCases(extractBinNames, [
        {
            it: 'extracts nothing when there is no bin name',
            input: testRepoDirPaths.fakePackage,
            expect: [],
        },
        {
            it: 'extracts package name even when it is scoped',
            input: testRepoDirPaths.scopedFakePackage,
            expect: ['@electrovir/scoped-fake-package'],
        },
        {
            it: 'extracts package name even when it is scoped',
            input: testRepoDirPaths.multipleBinsFakePackage,
            expect: [
                'bin1',
                'bin2',
            ],
        },
    ]);
});
