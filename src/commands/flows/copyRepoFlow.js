import RegistryModel from "../../model/RegistryModel.js";
import states from "../../states.js";
import {
    clear,
    configFill,
    configFillInput,
    configFillStore,
    getCommands,
    processPath
} from "../common.js";

import configModel from "../../model/ConfigModel.js";
import {askCommands, askPath} from "../asks.js";


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
            configData = configModel.getConfig();
            res = await configFill(configData, name);
            return cb(res.state, res.prompt);

        case states.STATE_CONFIG_FILL_RESPONSE:
            if(answer === 'Write other...') {
                configData = configModel.getConfig();
                res = await configFillInput(configData, name);
                return cb(res.state, res.prompt);
            }
        case states.STATE_CONFIG_FILL_CHOICES_RESPONSE:
        case states.STATE_CONFIG_FILL_INPUT_RESPONSE:
            configData = configModel.getConfig();
            res = await configFillStore(configData, name, answer);
            return cb(res.state, res.prompt);


        case states.STATE_NEXT:
            if(answer === 'Next >>>') {
                //TODO: show all again!
                clear();
                return cb(states.STATE_LAUNCH, askCommands());
            }
            path = RegistryModel.get('path');
            console.log(`Okay, init finished in ${path}. Enjoy!`);
            process.exit(0);
            break;

        default:
            return cb(states.STATE_INIT, askPath());
    }
}
