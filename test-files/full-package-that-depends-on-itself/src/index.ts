#!/usr/bin/env node

import {extractErrorMessage} from '@augment-vir/common';

export async function doAThing() {
    const args = process.argv.slice(2);

    if (args.includes('throw error')) {
        throw new Error(args.join(', '));
    } else {
        console.log(process.argv.slice(2));
    }
}

doAThing().catch((error) => {
    console.error(extractErrorMessage(error));
    process.exit(1);
});
