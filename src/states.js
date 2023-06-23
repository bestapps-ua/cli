
const STATE_LAUNCH = 'launch';
const STATE_INIT = 'init';
const STATE_INIT_CREATE = 'init::create';
const STATE_INIT_CREATE_FAILED = 'init::create::failed';
const STATE_FINISHED = 'finished';

let states = {
    STATE_LAUNCH,
    STATE_INIT,
    STATE_INIT_CREATE,
    STATE_INIT_CREATE_FAILED,
    STATE_FINISHED,
};

export default states;
