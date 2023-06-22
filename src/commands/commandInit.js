'use strict';

import states from "../states.js";

export async function commandInit(state) {
    switch(state) {
        default:
            console.log('HELLO WORLD', state);
            break;
    }
    return states.STATE_INIT;
}
