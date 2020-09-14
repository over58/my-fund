/**
 * 自动的增加一个version patch
 */
const fse = require('fs-extra');
const semver = require('semver');
const path = require('path');

const fileName = path.join(__dirname, '../package.json');
fse.readJSON(fileName, { throws: false })
    .then(packageJson => {
        packageJson.version = semver.inc(packageJson.version, 'patch');
        fse.writeJSON(fileName, packageJson, { spaces: '  ', EOL: '\n', encoding: 'utf-8' }, err => {
            if (err) {
                console.error(err);
                process.exit(-1);
            }
        });
    }).catch(err => {
        console.log(err);
        process.exit(-1);
    });