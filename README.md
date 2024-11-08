# test-as-package

Test a repo, inside of the repo itself, as if it were already deployed as an npm package. Packs, installs, and runs the package's CLI script.

# Installation

```bash
npm i -D test-as-package
```

This is meant for testing, so you probably want to install it as a dev dependency (hence the `-D` flag).

# Usage

## Run CLI command first

Pass your test scripts to the `test-as-package` cli command:

```bash
test-as-package mocha
```

It's probably best to include this in your `npm test` script:

```json
{
    "scripts": {
        "test": "test-as-package mocha"
    }
}
```

Replace `mocha` with whatever your test command is (such has `jest`).

The `test-as-package` CLI will handle packing up your package and installing it inside of NodeModules so it can be run as if it were installed as a package dependency. (This is done without affecting `package.json` or `package-lock.json`.

## Use the `runPackageCli` API

To actually test your package's CLi, use `runPackageCli` inside of tests:

<!-- example-link: src/readme-examples/run-package-output.example.ts -->

```TypeScript
import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {runPackageCli} from 'test-as-package';

describe('my CLI', () => {
    it('produces correct output', async () => {
        const cliOutputs = await runPackageCli({
            commandArgs: ['cliArg1'],
        });

        // assert that the command exited without any errors
        assert.strictEquals(cliOutputs.exitCode, 0);
    });
});
```
