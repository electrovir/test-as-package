import {runShellCommand} from '@augment-vir/node-js';
import {getPackageName} from './package-name';

export async function installTar({
    tarPath,
    repoDirPath,
}: {
    tarPath: string;
    repoDirPath: string;
}): Promise<void> {
    await runShellCommand(`npm i -D --no-save '${tarPath}'`, {
        cwd: repoDirPath,
        rejectOnError: true,
    });
}

export async function uninstallSelf(repoDirPath: string): Promise<void> {
    const packageName = await getPackageName(repoDirPath);

    await runShellCommand(`npm uninstall --no-save '${packageName}'`, {
        cwd: repoDirPath,
        rejectOnError: true,
    });
}
