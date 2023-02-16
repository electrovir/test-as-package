#!/usr/bin/env node

import {mapObjectValues, PartialAndUndefined} from '@augment-vir/common';
import {runShellCommand} from '@augment-vir/node-js';
import {join} from 'path';
import {
    packageBeingTestedBinNames,
    packageBeingTestedInstallationBinDirPath,
} from '../package-being-tested-env-names';
import {testAsPackageBinName} from '../test-as-package-bin-name';
import {extractBinNames} from './extract-bin-names';
import {packPackage} from './pack-package';
import {installTar, uninstallSelf} from './package-installation';

const flags = ['--bypass-install'];

function extractFlags(args: ReadonlyArray<string>): {bypassInstall: boolean} {
    return {bypassInstall: args.includes('--bypass-install')};
}

function extractCommandAndFlags(args: ReadonlyArray<string>) {
    const testAsPackageIndex = args.indexOf(testAsPackageBinName);
    if (testAsPackageIndex === -1) {
        return {
            testCommand: '',
            flags: extractFlags([]),
        };
    }
    const commandParts = args.slice(testAsPackageIndex + 1).filter((arg) => !flags.includes(arg));

    return {
        testCommand: commandParts.join(' '),
        flags: extractFlags(args),
    };
}

type BinEnvVars = {
    [packageBeingTestedBinNames]: string[];
    [packageBeingTestedInstallationBinDirPath]: string;
};

async function makeBinsExecutable(binVars: BinEnvVars) {
    const binNames = binVars[packageBeingTestedBinNames];

    await Promise.all(
        binNames.map(async (binName) => {
            await runShellCommand(`chmod +x ${binName}`, {
                cwd: binVars[packageBeingTestedInstallationBinDirPath],
                rejectOnError: true,
            });
        }),
    );
}

export async function cli({
    cwd: repoDirPath = process.cwd(),
    args = process.argv,
    skipUninstall = false,
}: PartialAndUndefined<{
    cwd: string;
    args: string[];
    skipUninstall: boolean;
}> = {}) {
    const {testCommand, flags} = extractCommandAndFlags(args);
    const tarPath = await packPackage(repoDirPath);
    if (!flags.bypassInstall) {
        await installTar({
            tarPath,
            repoDirPath,
        });
    }

    const newEnv: BinEnvVars = {
        [packageBeingTestedBinNames]: await extractBinNames(repoDirPath),
        [packageBeingTestedInstallationBinDirPath]: join(repoDirPath, 'node_modules', '.bin'),
    };

    await makeBinsExecutable(newEnv);

    const jsonNewEnv = mapObjectValues(newEnv, (key, value) => JSON.stringify(value));

    Object.assign(process.env, jsonNewEnv);

    if (testCommand) {
        await runShellCommand(testCommand, {
            cwd: repoDirPath,
            rejectOnError: true,
        });
    }

    if (!skipUninstall) {
        await uninstallSelf(repoDirPath);
    }

    return jsonNewEnv;
}

if (require.main === module) {
    cli();
}
