import fs from 'fs';

import states from "../states.js";

import {exec} from 'child_process';


import mv from 'fs-move';

import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp } from 'node:fs';

export function askPath() {
    return [
        {
            type: 'input',
            name: 'command',
            message: 'Please provide path',
            default: process.cwd(),
        }
    ];
}

export async function processPath(repo, path, canCreate) {
    if (fs.existsSync(path)) {
        return await initGitRepo(repo, path);
    } else {
        if (!canCreate) {
            return {
                state: states.STATE_INIT_CREATE,
                prompt: [
                    {
                        type: 'confirm',
                        name: 'command',
                        message: `Directory ${path} is not existing. Do you want to create it?`,
                    }
                ]
            };
        }
        try {
            fs.mkdirSync(path, {recursive: true, mode: '0755'});
            return await initGitRepo(repo, path);
        } catch (err) {
            return createFailed(path, err.message);
        }
    }
}

export function createFailed(path, message) {
    return {
        state: states.STATE_INIT_CREATE_FAILED,
        prompt: [
            {
                type: 'input',
                name: 'command',
                message: `Failed to create ${path}.\nError: ${message}.\nPlease provide new path or fix issue`,
                default: path,
            }
        ]
    };
}
export async function initGitRepo(repo, path) {
    let files = fs.readdirSync(path);
    let removeGit = true;
    for (const file of files) {
        if (file === '.git') {
            removeGit = false;
            continue;
        }
        let isDirectory = await new Promise((resolve, reject) => {
            fs.stat(path + '/' + file, (err, stats) => {
                resolve(stats.isDirectory());
            });
        });
        if (isDirectory) {
            return createFailed(path, `Directory already have other directories ${file}`);
        }
    }

    return await new Promise(async (resolve) => {


        mkdtemp(join(tmpdir(), 'bestapps-microservice'), (err, directory) => {
            let removeGitCommand = `rm -rf ${directory}/.git;`;
            if (err) {
                return resolve(createFailed(path, err.message));
            }

            exec(`git clone ${repo} ${directory}; ${removeGitCommand}`, async (err, stdout, stderr) => {
                if (err) {
                    // node couldn't execute the command
                    return resolve(createFailed(path, err.message));
                }
                let res = await move(`${directory}`, `${path}`);
                if (res) {
                    return resolve(res);
                }

                console.log(`Okay, init finished in ${path}. Enjoy!`);
                resolve({
                    state: states.STATE_FINISHED,
                });
            });
        });
    });
}

export async function move(from, to) {
    try {
        await new Promise((res, rej) => {
            mv(`${from}`, `${to}`, {overwrite: true}, err => {
                if (err) {
                    rej(err);
                }
                res();
            });
        });
    } catch (err) {
        return createFailed(to, err.message);
    }
}
