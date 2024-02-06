#!/usr/bin/env node

import AskModel from "../src/model/AskModel.js";
import {getCommands} from "../src/commands/common.js";
import {askCommands} from "../src/commands/asks.js";


AskModel.ask(askCommands(), getCommands);
