
const STATE_LAUNCH = 'launch';
const STATE_INIT = 'init';
const STATE_INIT_CREATE = 'init::create';
const STATE_INIT_CREATE_FAILED = 'init::create::failed';
const STATE_CONFIG_FILL = 'config::fill';
const STATE_CONFIG_FILL_RESPONSE = 'config::fill::response';
const STATE_CONFIG_FILL_CHOICES_RESPONSE = 'config::fill::choices::response';
const STATE_CONFIG_FILL_INPUT_RESPONSE = 'config::fill::input::response';
const STATE_NEXT = 'next';
const STATE_FINISHED = 'finished';

let states = {
    STATE_LAUNCH,
    STATE_INIT,
    STATE_INIT_CREATE,
    STATE_INIT_CREATE_FAILED,
    STATE_CONFIG_FILL,
    STATE_CONFIG_FILL_RESPONSE,
    STATE_CONFIG_FILL_CHOICES_RESPONSE,
    STATE_CONFIG_FILL_INPUT_RESPONSE,
    STATE_FINISHED,
    STATE_NEXT,
};

export default states;
