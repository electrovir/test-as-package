import {check} from '@augment-vir/assert';
import {extractErrorMessage, wrapInTry} from '@augment-vir/common';
import {
    ShellOutput,
    interpolationSafeWindowsPath,
    runShellCommand,
    type RunShellCommandOptions,
} from '@augment-vir/node';
import {join, relative} from 'node:path';
import {defineShape, parseJsonWithShape, type ShapeDefinition} from 'object-shape-tester';
import {
    packageBeingTestedBinNames,
    packageBeingTestedInstallationBinDirPath,
} from '../package-being-tested-env-names.js';
import {testAsPackageBinName} from '../test-as-package-bin-name.js';

/** Options for {@link runPackageCli}. */
export type RunPackageCliOptions = Partial<
    {
        commandArgs?: ReadonlyArray<string>;
        executableName?: string | undefined;
    } & RunShellCommandOptions
>;

/**
 * Use this to execute your package's CLI within a test. This will only work if your test shell
 * command is wrapped in a `test-as-package` command.
 */
export async function runPackageCli(
    options: RunPackageCliOptions = {
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
        interpolationSafeWindowsPath(relative(workingDir, join(binDirPath, executableName))),
        ...commandArgs.map((arg) => `'${arg}'`),
    ].join(' ');

    const shellOutput = await runShellCommand(fullCommand, options);
    return shellOutput;
}

function readEnvVar<Shape>(
    envVar: typeof packageBeingTestedBinNames | typeof packageBeingTestedInstallationBinDirPath,
    shapeMatcher: Shape,
): ShapeDefinition<Shape, false>['runtimeType'] {
    const rawEnvValue = process.env[envVar];
    const failureMessage = `It should have been set by the '${testAsPackageBinName}' cli. Make sure to use that CLI to run tests`;

    if (!rawEnvValue) {
        throw new Error(`Failed to read '${envVar}' env variable: ${failureMessage}`);
    }

    const parsedValue = wrapInTry(
        () => parseJsonWithShape(rawEnvValue, defineShape(shapeMatcher)),
        {
            handleError(error) {
                throw new Error(
                    `Failed to parse '${envVar}' env variable: ${failureMessage}: ${extractErrorMessage(
                        error,
                    )}`,
                );
            },
        },
    );

    if (check.isArray(parsedValue) && !parsedValue.length) {
        throw new Error(`Parsed an array from env variable '${envVar}' but it was an empty array.`);
    }

    return parsedValue;
}
