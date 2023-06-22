'use strict';

import {COMMAND_INIT} from "./commands.js";
import {commandInit} from "./commands/commandInit.js";

let routing = {
    [COMMAND_INIT]: {
        cb: commandInit
    }
};

export default routing;
