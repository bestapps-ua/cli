'use strict';

import RegistryModel from "../model/RegistryModel.js";
import states from "../states.js";
import constants from "../constants.js";
import {askPath, processPath} from "./common.js";


export async function commandInitMicroservice(state, answers, cb) {
    let res;
    let path;
    let canCreate = RegistryModel.get('canCreate');
    switch (state) {
        case states.STATE_INIT_CREATE:
            canCreate = answers.command;
            if (!canCreate) {
                console.log('Okay, exiting program');
                return cb(states.STATE_FINISHED);
            }
            path = RegistryModel.get('path');
            res = await processPath(constants.microservice, path, canCreate);
            RegistryModel.set('canCreate', canCreate);
            return cb(res.state, res.prompt);
        case states.STATE_INIT_CREATE_FAILED:
        case states.STATE_INIT:
            path = answers.command;
            RegistryModel.set('path', path);
            res = await processPath(constants.microservice, path, canCreate);
            return cb(res.state, res.prompt);
        default:
            return cb(states.STATE_INIT, askPath());
    }
}
