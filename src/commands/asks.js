import {COMMAND_INIT_APIGW, COMMAND_INIT_MICROSERVICE, COMMAND_INIT_USER_MICROSERVICE} from "../commands.js";
import states from "../states.js";

export function askCommands() {
    return [
        {
            type: 'list',
            name: 'command',
            message: 'What do you want to do?',
            choices: [
                COMMAND_INIT_MICROSERVICE,
                COMMAND_INIT_APIGW,
                COMMAND_INIT_USER_MICROSERVICE,
            ],
        }
    ];
}

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

export function askCreateFailed(path, message) {
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

export function askConfigFillInput(name, configKey, defaultValue = '') {
    return {
        state: states.STATE_CONFIG_FILL_INPUT_RESPONSE,
        prompt: [
            {
                type: 'input',
                name: 'command',
                message: `${name} config ${configKey} value:`,
                default: defaultValue,
            }
        ]
    }
}
