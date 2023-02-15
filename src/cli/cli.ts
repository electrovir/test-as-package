import {runShellCommand} from '@augment-vir/node-js';
import {join} from 'path';
import {
    packageBeingTestedBinNames,
    packageBeingTestedInstallationBinDirPath,
} from '../package-being-tested-env-names';
import {testAsPackageBinName} from '../test-as-package-bin-name';
import {extractBinNames} from './extract-bin-names';
import {packPackage} from './pack-package';
import {installTar} from './package-installation';

const flags = ['--bypass-install'];

function extractFlags(args: ReadonlyArray<string>): {bypassInstall: boolean} {
    return {bypassInstall: args.includes('--bypass-install')};
}

function extractCommandAndFlags(args: ReadonlyArray<string>) {
    const testAsPackageIndex = args.indexOf(testAsPackageBinName);
    if (testAsPackageIndex === -1) {
        throw new Error(
            `Couldn't find '${testAsPackageBinName}' index in args list: '[${args.join(', ')}]'`,
        );
    }
    const commandParts = args.slice(testAsPackageIndex + 1).filter((arg) => !flags.includes(arg));

    return {
        command: commandParts.join(' '),
        flags: extractFlags(args),
    };
}

async function cli() {
    const repoDirPath = process.cwd();

    const args = process.argv;

    const {command, flags} = extractCommandAndFlags(args);
    const tarPath = await packPackage(repoDirPath);
    if (!flags.bypassInstall) {
        await installTar({
            tarPath,
            repoDirPath,
        });
    }

    const binDirPath = join(repoDirPath, 'node_modules', '.bin');

    await runShellCommand(command, {
        cwd: repoDirPath,
        rejectOnError: true,
        env: {
            ...process.env,
            [packageBeingTestedBinNames]: JSON.stringify(await extractBinNames(repoDirPath)),
            [packageBeingTestedInstallationBinDirPath]: binDirPath,
        },
    });
}
