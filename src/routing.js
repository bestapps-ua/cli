'use strict';

import {generateCommands} from "./commands.js";

let commands = generateCommands();
let routing = {};
for (const command of commands) {
    routing[`Init ${command.name}`] = {cb: command.callback};
}

export default routing;
