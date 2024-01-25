import fs from 'fs';

import states from "../states.js";

import {exec} from 'child_process';


import mv from 'fs-move';

import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {mkdtemp} from 'node:fs';
import RegistryModel from "../model/RegistryModel.js";

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
                let res = await moveFiles(`${directory}`, `${path}`);
                if (res) {
                    return resolve(res);
                }

                //console.log(`Okay, init finished in ${path}. Enjoy!`);
                //console.log(`Okay, init finished in ${path}. Please fill config data:`);
                resolve({
                    state: states.STATE_CONFIG_FILL,
                    prompt: [
                        {
                            type: 'confirm',
                            name: 'command',
                            message: `Okay, init finished in ${path}. Do you want fill config data?`,
                        }
                    ]
                });
            });
        });
    });
}

async function moveFiles(from, to) {
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

function makeLinearConfig(config, list, currentKey = undefined, level = 0) {
    let keys = Object.keys(config);
    if (keys.length === 0) {
        return;
    }
    if (!currentKey) {
        return makeLinearConfig(config, list, keys[0], level);
    }
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let currentKeys = currentKey.split('::');
        let keyByLevel = currentKeys[level];
        if (key === keyByLevel) {
            let conf = config[key];
            if (Array.isArray(conf) || typeof conf !== 'object') {
                list.push({
                    currentKey,
                    value: conf
                });
            } else {
                for (let k of Object.keys(conf)) {
                    makeLinearConfig(conf, list, `${currentKey}::${k}`, level + 1);
                }
            }
            if (keys[i + 1]) {
                return makeLinearConfig(config, list, keys[i + 1], level);
            }
        }
    }
}

function getConfigByLevel(config, key) {
    let currentKeys = key.split("::");
    let nextKey = currentKeys[0];
    if (currentKeys.length > 1) {
        currentKeys.shift();
        let nextKeys = currentKeys.join("::");
        return getConfigByLevel(config[nextKey], nextKeys);
    }
    return config[nextKey];
}

export async function configFill(config, name) {
    let configKey = RegistryModel.get('configKey');
    let list = [];
    makeLinearConfig(config, list);
    if (list.length === 0) {
        //TODO: return other state STATE_CONFIG_READ_ERROR
    }
    if (!configKey) {
        configKey = list[0].currentKey;
    }
    let configValue = getConfigByLevel(config, configKey);
    RegistryModel.set('configKey', configKey);
    return askFillConfigKey(config, name, configKey, configValue);
}

function askFillConfigKey(config, name, configKey, configValue) {
    //TODO: get from registry other possible keys to select on secondary position
    return {
        state: states.STATE_CONFIG_FILL_RESPONSE,
        prompt: [
            {
                type: 'list',
                name: 'command',
                message: `${name} config choose ${configKey}`,
                editableList: true,
                choices: [
                    configValue,
                    'Write other...'
                ],
                default: configValue,
            }
        ]
    }
}

export async function configFillInput(name) {
    let configKey = RegistryModel.get('configKey');
    return {
        state: states.STATE_CONFIG_FILL_INPUT_RESPONSE,
        prompt: [
            {
                type: 'input',
                name: 'command',
                message: `${name} config ${configKey} value:`,
            }
        ]
    }
}

function storeConfig(config, key, value) {
    let currentKeys = key.split("::");
    let nextKey = currentKeys[0];
    if (!config[nextKey]) {
        config[nextKey] = {};
    }
    if (currentKeys.length > 1) {
        currentKeys.shift();
        let nextKeys = currentKeys.join("::");
        return storeConfig(config[nextKey], nextKeys, value);
    }
    config[nextKey] = value;
    return config;
}

export async function configFillStore(config, name, value) {
    let configKey = RegistryModel.get('configKey');
    let configData = RegistryModel.get('configData') || {};
    storeConfig(configData, configKey, value);
    let list = [];
    makeLinearConfig(config, list);
    let nextKey;
    for (let i = 0; i < list.length; i++) {
        if (list[i].currentKey === configKey) {
            if (list[i + 1]) {
                nextKey = list[i + 1].currentKey;
            }
            break;
        }
    }

    if (nextKey) {
        let configValue = getConfigByLevel(config, nextKey);
        RegistryModel.set('configKey', nextKey);
        return askFillConfigKey(config, name, nextKey, configValue);
    }
    let path = RegistryModel.get('path');
    let filename = `${path}/config/local.json`;
    fs.writeFileSync(filename, JSON.stringify(configData), {encoding: 'utf8'});
    return {
        state: states.STATE_NEXT,
        prompt: [
            {
                type: 'list',
                name: 'command',
                message: `Data stored in ${filename}. That's it! Are you want to create other?`,
                editableList: true,
                choices: [
                    'Next >>>',
                    'Finish.'
                ],
                default: 'Next >>>',
            }
        ]
    }
}
