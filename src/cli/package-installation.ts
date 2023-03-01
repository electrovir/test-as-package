import {readPackageJson, runShellCommand} from '@augment-vir/node-js';
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
        hookUpToConsole: true,
    });
}

export async function uninstallSelf(repoDirPath: string): Promise<void> {
    if (await doesSelfDependOnSelf(repoDirPath)) {
        // if the package actually depends on itself, don't uninstall it
        return;
    }

    const packageName = await getPackageName(repoDirPath);

    await runShellCommand(`npm uninstall --no-save '${packageName}'`, {
        cwd: repoDirPath,
        rejectOnError: true,
    });
}

async function doesSelfDependOnSelf(repoDirPath: string): Promise<boolean> {
    const packageName = await getPackageName(repoDirPath);

    const packageJson = await readPackageJson(repoDirPath);

    const allDeps = [
        Object.keys(packageJson.dependencies ?? []),
        Object.keys(packageJson.devDependencies ?? []),
        Object.keys(packageJson.peerDependencies ?? []),
    ].flat();

    return allDeps.includes(packageName);
}
