import {extractErrorMessage, isRuntimeTypeOf, parseJson} from '@augment-vir/common';
import {runShellCommand, RunShellCommandParams, ShellOutput} from '@augment-vir/node-js';
import {join, relative} from 'path';
import {
    packageBeingTestedBinNames,
    packageBeingTestedInstallationBinDirPath,
} from '../package-being-tested-env-names';
import {testAsPackageBinName} from '../test-as-package-bin-name';

export type RunPackageCliInputs = Partial<
    {
        commandArgs?: ReadonlyArray<string>;
        executableName?: string | undefined;
    } & RunShellCommandParams
>;

export async function runPackageCli(
    options: RunPackageCliInputs = {
        commandArgs: [],
    },
): Promise<ShellOutput> {
    const commandArgs = options.commandArgs ?? [];
    let executableName = options.executableName;

    const availableBinNames = readEnvVar(packageBeingTestedBinNames, ['']);
    const binDirPath = readEnvVar(packageBeingTestedInstallationBinDirPath, '');

    if (!executableName) {
        if (availableBinNames.length === 1) {
            executableName = availableBinNames[0];
        } else {
            throw new Error(
                `Multiple command names are available but none were chosen, please provide a executableName input from the following: ${availableBinNames.join(
                    ', ',
                )}`,
            );
        }
    } else if (executableName && !availableBinNames.includes(executableName)) {
        throw new Error(
            `Tried to run package by executable name '${executableName}' but that name does not exist for the tested package.`,
        );
    }

    if (!executableName) {
        throw new Error(`Got no executable name to test.`);
    }

    const workingDir = options.cwd || process.cwd();

    const fullCommand = [
        './' + relative(workingDir, join(binDirPath, executableName)),
        ...commandArgs.map((arg) => `'${arg}'`),
    ].join(' ');

    const shellOutput = await runShellCommand(fullCommand, options);
    return shellOutput;
}

function readEnvVar<ReturnGeneric>(
    envVar: typeof packageBeingTestedBinNames | typeof packageBeingTestedInstallationBinDirPath,
    shapeMatcher: ReturnGeneric,
): ReturnGeneric {
    const rawEnvValue = process.env[envVar];
    const failureMessage = `It should have been set by the '${testAsPackageBinName}' cli. Make sure to use that CLI to run tests`;

    if (!rawEnvValue) {
        throw new Error(`Failed to read '${envVar}' env variable: ${failureMessage}`);
    }

    const parsedValue = parseJson({
        jsonString: rawEnvValue,
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
