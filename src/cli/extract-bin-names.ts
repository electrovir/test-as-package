import {isRuntimeTypeOf} from '@augment-vir/common';
import {readFile} from 'fs/promises';
import {join} from 'path';
import {PackageJson} from 'type-fest';
import {getPackageName} from './package-name';

export async function extractBinNames(repoDirPath: string): Promise<string[]> {
    const packageJsonContents = (await readFile(join(repoDirPath, 'package.json'))).toString();

    const parsedPackageJson: PackageJson = JSON.parse(packageJsonContents);

    if (isRuntimeTypeOf(parsedPackageJson.bin, 'string')) {
        return [await getPackageName(repoDirPath)];
    } else if (isRuntimeTypeOf(parsedPackageJson.bin, 'object')) {
        return Object.keys(parsedPackageJson.bin);
    } else {
        return [];
    }
}
