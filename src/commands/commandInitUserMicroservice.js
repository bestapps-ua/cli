'use strict';

import constants from "../constants.js";
import {copyRepoFlow} from "./flows/copyRepoFlow.js";

export async function commandInitUserMicroservice(state, answers, cb) {
    copyRepoFlow(state, answers, constants['user.microservice'], 'User Microservice', cb);
}
