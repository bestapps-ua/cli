import fs from 'fs';

import states from "../states.js";

import {exec} from 'child_process';


import mv from 'fs-move';

import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {mkdtemp} from 'node:fs';
import RegistryModel from "../model/RegistryModel.js";
import routing from "../routing.js";
import AskModel from "../model/AskModel.js";
import configModel from "../model/ConfigModel.js";
import {askConfigFillInput, askCreateFailed} from "./asks.js";
import historyModel from "../model/HistoryModel.js";


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
            return askCreateFailed(path, err.message);
        }
    }
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
            return askCreateFailed(path, `Directory already have other directories ${file}`);
        }
    }

    return await new Promise(async (resolve) => {
        mkdtemp(join(tmpdir(), 'bestapps-microservice'), (err, directory) => {
            let removeGitCommand = `rm -rf ${directory}/.git;`;
            if (err) {
                return resolve(askCreateFailed(path, err.message));
            }

            exec(`git clone ${repo} ${directory}; ${removeGitCommand}`, async (err, stdout, stderr) => {
                if (err) {
                    // node couldn't execute the command
                    return resolve(askCreateFailed(path, err.message));
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
        return askCreateFailed(to, err.message);
    }
}


export async function configFill(config, name) {
    let configKey = RegistryModel.get('configKey');
    let list = [];
    configModel.makeLinearConfig(config, list);
    if (list.length === 0) {
        //TODO: return other state STATE_CONFIG_READ_ERROR
    }
    if (!configKey) {
        configKey = list[0].currentKey;
    }
    let configValue = configModel.getConfigByLevel(config, configKey);
    RegistryModel.set('configKey', configKey);
    return askFillConfigKey(config, name, configKey, configValue);
}

function askFillConfigKey(config, name, configKey, configValue) {
    function onlyUnique(value, index, array) {
        return array.indexOf(value) === index;
    }

    configValue = `${configValue}`.trim();
    let historyConfig = historyModel.getHistoryConfig();
    let historyKey = historyModel.normalizeHistoryKey(configKey);

    if (configValue.length === 0 && !historyConfig[historyKey]) {
        return askConfigFillInput(name, configKey);
    }
    let list = [];

    if (["true", "false"].includes(configValue)) {
        list = [
            configValue,
            configValue === "true" ? "false" : "true"
        ];
    } else {
        list = [
            configValue,
        ];

        let isService = historyModel.isValueWithYourService(configValue);
        if (isService || isService === '') {
            let sk = historyConfig['YOURSERVICENAME'] && historyConfig['YOURSERVICENAME'][0];
            if (sk) {
                let your = configValue.replace('YOURSERVICENAME', sk);
                list.push(your);
            }
        }
        if (historyConfig[historyKey]) {
            list = list.concat(historyConfig[historyKey]);
        }
        list = list.filter(onlyUnique);
        list.push('Write other...');
    }
    return {
        state: states.STATE_CONFIG_FILL_RESPONSE,
        prompt: [
            {
                type: 'list',
                name: 'command',
                message: `${name} config choose ${configKey}`,
                editableList: true,
                choices: list,
                default: configValue,
            }
        ]
    }
}

export async function configFillInput(config, name) {
    let configKey = RegistryModel.get('configKey');
    let configValue = configModel.getConfigByLevel(config, configKey);
    let isService = historyModel.isValueWithYourService(configValue);
    let historyConfig = historyModel.getHistoryConfig();
    if (isService || isService === '') {
        let sk = historyConfig['YOURSERVICENAME'] && historyConfig['YOURSERVICENAME'][0];
        if(sk) {
            let your = configValue.replace('YOURSERVICENAME', sk);
            return askConfigFillInput(name, configKey, your);
        }
    }
    return askConfigFillInput(name, configKey);
}

export async function configFillStore(config, name, value) {
    let configKey = RegistryModel.get('configKey');
    let configData = RegistryModel.get('configData') || {};
    configModel.storeConfig(configData, configKey, value);
    let defaultValue = configModel.getConfigByLevel(config, configKey);
    historyModel.storeSelectedKeyValueHistory(configKey, value, defaultValue);
    let list = [];
    configModel.makeLinearConfig(config, list);
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
        let configValue = configModel.getConfigByLevel(config, nextKey);
        RegistryModel.set('configKey', nextKey);
        RegistryModel.set('configData', configData);
        return askFillConfigKey(config, name, nextKey, configValue);
    }
    const filename = configModel.createConfig(configData);
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


export async function getCommands(answers) {
    let state = RegistryModel.get('state') || states.STATE_LAUNCH ;
    let cb = RegistryModel.get('cb');

    if(state === states.STATE_LAUNCH) {
        cb = answers.command;
    }
    console.log('answers', answers);
    await routing[cb].cb(state, answers, (newState, prompt) => {
        state = newState;
        if(state === states.STATE_FINISHED) {
            return ;
        }
        RegistryModel.set('state', state);
        AskModel.ask(prompt, getCommands);
    });

    RegistryModel.set('state', state);
    RegistryModel.set('cb', cb);
}

export function clear() {
    RegistryModel.set('configKey', undefined);
    RegistryModel.set('configData', {});
    historyModel.clear();
    configModel.clear();
}
