#!/usr/bin/env node

import inquirer from 'inquirer';
import {COMMAND_INIT} from "../src/commands.js";
import routing from "../src/routing.js";
import RegistryModel from "../src/model/RegistryModel.js";
import states from "../src/states.js";

let state = RegistryModel.get('state') || states.STATE_LAUNCH ;
let cb = RegistryModel.get('cb');

inquirer
    .prompt([
        {
            type: 'list',
            name: 'command',
            message: 'What do you want to do?',
            choices: [
                COMMAND_INIT,
            ],
        }
    ])
    .then(async (answers) => {
        if(state === states.STATE_LAUNCH) {
            cb = answers.command;
        }
        state = await routing[cb].cb(state);
        RegistryModel.set('state', state);
        RegistryModel.set('cb', cb);
    })
    .catch((error) => {
        console.log('INTERNAL ERROR', error);
    });
