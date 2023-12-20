#!/user/bin/env node
/* eslint-disable no-console */

const { execSync } = require('child_process');

const runCommand = (command) => {
    try {
        execSync(command, {
            stdio: 'inherit'
        });
    } catch (error) {
        console.error(`Failed to execute ${command}`, error);
        return false;
    }

    return true;
};

const repoName = process.argv[2];
const gitCheckoutCommand = `git clone --depth 1 https://github.com/muhammedozalp/festarter-v1 ${repoName}`;
const installDepsCommand = `cd ${repoName} && yarn`;

console.log(`Cloning the repository with the name ${repoName}`);

const checkedOut = runCommand(gitCheckoutCommand);
if (!checkedOut) process.exit(-1);

console.log(`Installing dependencies for ${repoName}`);
const installDependencies = runCommand(installDepsCommand);
if (!installDependencies) process.exit(-1);

console.log('Congratulations! You are ready. Follow the following commands to start');
console.log(`cd ${repoName} && yarn start`);
