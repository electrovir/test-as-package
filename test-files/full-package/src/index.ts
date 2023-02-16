#!/usr/bin/env node

export function doAThing() {
    console.log(process.argv.slice(2));
}

doAThing();
