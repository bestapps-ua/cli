'use strict';

import constants from "../constants.js";
import {copyRepoFlow} from "./flows/copyRepoFlow.js";

export async function commandInitMicroservice(state, answers, cb) {
    copyRepoFlow(state, answers, constants.microservice, 'Microservice', cb);
}
