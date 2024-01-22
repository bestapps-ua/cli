'use strict';

import {COMMAND_INIT_MICROSERVICE} from "./commands.js";
import {commandInitMicroservice} from "./commands/commandInitMicroservice.js";

let routing = {
    [COMMAND_INIT_MICROSERVICE]: {
        cb: commandInitMicroservice
    }
};

export default routing;
