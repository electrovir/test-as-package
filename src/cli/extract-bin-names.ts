import {check} from '@augment-vir/assert';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {PackageJson} from 'type-fest';
import {getPackageName} from './package-name.js';

export async function extractBinNames(repoDirPath: string): Promise<string[]> {
    const packageJsonContents = (await readFile(join(repoDirPath, 'package.json'))).toString();

    const parsedPackageJson: PackageJson = JSON.parse(packageJsonContents);

    if (check.isString(parsedPackageJson.bin)) {
        return [await getPackageName(repoDirPath)];
    } else if (check.isObject(parsedPackageJson.bin)) {
        return Object.keys(parsedPackageJson.bin);
    } else {
        return [];
    }
}
