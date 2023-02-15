import {itCases} from '@augment-vir/chai';
import {testRepoDirPaths} from '../test-file-paths.test-helper';
import {extractBinNames} from './extract-bin-names';

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
