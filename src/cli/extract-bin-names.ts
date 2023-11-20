import {readFile} from 'fs/promises';
import {join} from 'path';
import {isRunTimeType} from 'run-time-assertions';
import {PackageJson} from 'type-fest';
import {getPackageName} from './package-name';

export async function extractBinNames(repoDirPath: string): Promise<string[]> {
    const packageJsonContents = (await readFile(join(repoDirPath, 'package.json'))).toString();

    const parsedPackageJson: PackageJson = JSON.parse(packageJsonContents);

    if (isRunTimeType(parsedPackageJson.bin, 'string')) {
        return [await getPackageName(repoDirPath)];
    } else if (isRunTimeType(parsedPackageJson.bin, 'object')) {
        return Object.keys(parsedPackageJson.bin);
    } else {
        return [];
    }
}
