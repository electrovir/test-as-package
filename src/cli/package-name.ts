import {runShellCommand} from '@augment-vir/node';

export async function getPackageName(repoDirPath: string): Promise<string> {
    const packageName = (
        await runShellCommand(`cut -d "=" -f 2 <<< $(npm run env | grep "npm_package_name")`, {
            cwd: repoDirPath,
            rejectOnError: true,
        })
    ).stdout.trim();

    return packageName;
}
