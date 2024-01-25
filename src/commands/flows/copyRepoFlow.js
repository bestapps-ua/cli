import RegistryModel from "../../model/RegistryModel.js";
import states from "../../states.js";
import {askPath, configFill, configFillInput, configFillStore, processPath} from "../common.js";
import fs from 'fs';

function getConfig() {
    let path = RegistryModel.get('path');
    let filename = `${path}/config/example.json`;
    RegistryModel.set('config::filename', filename);
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

export async function copyRepoFlow(state, answers, repo, name, cb) {
    let res;
    let path;
    let canCreate = RegistryModel.get('canCreate');
    let answer = answers.command;
    let configData;
    console.log('STATE', state);
    switch (state) {
        case states.STATE_INIT_CREATE:
            canCreate = answer;
            if (!canCreate) {
                console.log('Okay, exiting program');
                return cb(states.STATE_FINISHED);
            }
            path = RegistryModel.get('path');
            res = await processPath(repo, path, canCreate);
            RegistryModel.set('canCreate', canCreate);
            return cb(res.state, res.prompt);
        case states.STATE_INIT_CREATE_FAILED:
        case states.STATE_INIT:
            path = answers.command;
            RegistryModel.set('path', path);
            res = await processPath(repo, path, canCreate);
            return cb(res.state, res.prompt);
        case states.STATE_CONFIG_FILL:
            configData = getConfig();
            res = await configFill(configData, name);
            return cb(res.state, res.prompt);
        case states.STATE_CONFIG_FILL_RESPONSE:
            if(answer === 'Write other...') {
                res = await configFillInput(name);
                return cb(res.state, res.prompt);
            }
        case states.STATE_CONFIG_FILL_INPUT_RESPONSE:
            configData = getConfig();
            res = await configFillStore(configData, name, answer);
            return cb(res.state, res.prompt);
            break;

        case states.STATE_NEXT:
            if(answer === 'Next >>>') {
                //TODO: show all again!
            }
            path = RegistryModel.get('path');
            console.log(`Okay, init finished in ${path}. Enjoy!`);
            process.exit(0);
            break;

        default:
            return cb(states.STATE_INIT, askPath());
    }
}
