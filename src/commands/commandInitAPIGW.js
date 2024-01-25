'use strict';

import constants from "../constants.js";
import {copyRepoFlow} from "./flows/copyRepoFlow.js";

export async function commandInitAPIGW(state, answers, cb) {
    copyRepoFlow(state, answers, constants.apigw, 'APIGW', cb);
}
