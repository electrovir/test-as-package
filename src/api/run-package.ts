import {extractErrorMessage, isRuntimeTypeOf, parseJson} from '@augment-vir/common';
import {runShellCommand, RunShellCommandParams, ShellOutput} from '@augment-vir/node-js';
import {join} from 'path';
import {
    packageBeingTestedBinNames,
    packageBeingTestedInstallationBinDirPath,
} from '../package-being-tested-env-names';
import {testAsPackageBinName} from '../test-as-package-bin-name';

export async function runPackage({
    executableName,
    commandArgs,
    shellCommandOptions,
}: {
    executableName?: string | undefined;
    commandArgs: ReadonlyArray<string>;
    shellCommandOptions?: RunShellCommandParams | undefined;
}): Promise<ShellOutput> {
    const availableBinNames = readEnvVar(packageBeingTestedBinNames, ['']);
    const binDirPath = readEnvVar(packageBeingTestedInstallationBinDirPath, '');

    if (!executableName) {
        executableName = availableBinNames[0]!;
    } else if (!availableBinNames.includes(executableName)) {
        throw new Error(
            `Tried to run package by executable name '${executableName}' but that name does not exist for the tested package.`,
        );
    }

    const fullCommand = [
        join(binDirPath, executableName),
        ...commandArgs,
    ].join(' ');

    const shellOutput = await runShellCommand(fullCommand, shellCommandOptions);
    return shellOutput;
}

function readEnvVar<ReturnGeneric>(
    envVar: typeof packageBeingTestedBinNames | typeof packageBeingTestedInstallationBinDirPath,
    shapeMatcher: ReturnGeneric,
): ReturnGeneric {
    const availableBinNamesRaw = process.env[envVar];
    const failureMessage = `It should have been set by the '${testAsPackageBinName}' cli. Make sure to use that CLI to run tests.`;

    if (!availableBinNamesRaw) {
        throw new Error(`Failed to read '${envVar}' env variable: ${failureMessage}`);
    }

    const parsedValue = parseJson({
        jsonString: availableBinNamesRaw,
        shapeMatcher: shapeMatcher,
        errorHandler: (error) => {
            throw new Error(
                `Failed to parse '${envVar}' env variable: ${failureMessage}: ${extractErrorMessage(
                    error,
                )}`,
            );
        },
    });

    if (isRuntimeTypeOf(parsedValue, 'array')) {
        if (!parsedValue.length) {
            throw new Error(
                `Parsed an array from env variable '${envVar}' but it was an empty array.`,
            );
        }
    }

    return parsedValue;
}
