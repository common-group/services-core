const { writeFileSync, copyFileSync, unlinkSync } = require('fs');
const { homedir } = require('os');
const { resolve } = require('path');
const { execSync } = require('child_process');
const packageJson = require('./package.json');
const rnd = Math.floor(Math.random() * 999999999999999);
const version = `${packageJson.version}-${rnd}`;
try {
    copyFileSync('./package.json', './package.cache.json');
    writeFileSync('./package.json', JSON.stringify({ ...packageJson, version }, null, 2), 'utf8');
    writeFileSync('../catarse/deps-patch.json', JSON.stringify({ 'catarse.js': version }, null, 2), 'utf8');
    execSync('npm publish --registry http://localhost:4873');
} catch (error) {
    console.warn('Failed to publish');
    console.error(error);
} finally {
    copyFileSync('./package.cache.json', './package.json');
    unlinkSync('./package.cache.json');
}
