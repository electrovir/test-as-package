import {check} from '@augment-vir/assert';
import {runShellCommand} from '@augment-vir/node';
import {join} from 'node:path';

export async function packPackage(packageDirPath: string): Promise<string> {
    const packShellResults = await runShellCommand('npm pack', {
        cwd: packageDirPath,
        rejectOnError: true,
        hookUpToConsole: true,
    });

    const packOutputLines = packShellResults.stdout.trim().split('\n').filter(check.isTruthy);
    const tarFileName = packOutputLines.slice(-1)[0];

    if (!tarFileName) {
        throw new Error(
            `Failed to find tar file name from npm pack outputs: '[${packOutputLines.join(', ')}]'`,
        );
    }

    return join(packageDirPath, tarFileName);
}
