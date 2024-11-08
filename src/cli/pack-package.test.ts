import {assert} from '@augment-vir/assert';
import {describe, itCases} from '@augment-vir/test';
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {testRepoDirPaths} from '../test-file-paths.test-helper.js';
import {packPackage} from './pack-package.js';

describe(packPackage.name, () => {
    itCases(
        async (...inputs: Parameters<typeof packPackage>) => {
            const output = await packPackage(...inputs);
            assert.isTrue(existsSync(output), `'${output}' file was not found`);
            return output;
        },
        [
            {
                it: 'returns the proper tar file path',
                input: testRepoDirPaths.fakePackage,
                expect: join(testRepoDirPaths.fakePackage, 'fake-package-0.0.0.tgz'),
            },
            {
                it: 'handles scoped package names',
                input: testRepoDirPaths.scopedFakePackage,
                expect: join(
                    testRepoDirPaths.scopedFakePackage,
                    'electrovir-scoped-fake-package-0.0.0.tgz',
                ),
            },
        ],
    );
});
