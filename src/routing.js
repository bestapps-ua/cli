'use strict';

import {COMMAND_INIT_APIGW, COMMAND_INIT_MICROSERVICE, COMMAND_INIT_USER_MICROSERVICE} from "./commands.js";
import {commandInitMicroservice} from "./commands/commandInitMicroservice.js";
import {commandInitAPIGW} from "./commands/commandInitAPIGW.js";
import {commandInitUserMicroservice} from "./commands/commandInitUserMicroservice.js";

let routing = {
    [COMMAND_INIT_MICROSERVICE]: {
        cb: commandInitMicroservice
    },
    [COMMAND_INIT_APIGW]: {
        cb: commandInitAPIGW
    },
    [COMMAND_INIT_USER_MICROSERVICE]: {
        cb: commandInitUserMicroservice
    }
};

export default routing;
