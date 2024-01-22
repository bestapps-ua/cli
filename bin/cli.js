#!/usr/bin/env node

import {COMMAND_INIT_MICROSERVICE} from "../src/commands.js";
import routing from "../src/routing.js";
import RegistryModel from "../src/model/RegistryModel.js";
import states from "../src/states.js";
import AskModel from "../src/model/AskModel.js";

let state = RegistryModel.get('state') || states.STATE_LAUNCH ;


const prompt = [
    {
        type: 'list',
        name: 'command',
        message: 'What do you want to do?',
        choices: [
            COMMAND_INIT_MICROSERVICE,
        ],
    }
];

const callback = async (answers) => {
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
        AskModel.ask(prompt, callback);
    });

    RegistryModel.set('state', state);
    RegistryModel.set('cb', cb);
}

AskModel.ask(prompt, callback);
