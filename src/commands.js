'use strict';

import {copyRepoFlow} from "./commands/flows/copyRepoFlow.js";

let commands = [
    {
        name: 'Microservice',
        repo: 'git@github.com:bestapps-ua/microservice.starter.kit.git',
    },
    {
        name: 'APIGW',
        repo: 'git@github.com:bestapps-ua/microservice.apigw.git',
    },
    {
        name: 'User Microservice',
        repo: 'git@bitbucket.org:best-apps/user.microservice.git',
    },
    {
        name: 'Session Microservice',
        repo: 'git@bitbucket.org:best-apps/session.microservice.git',
    },
    {
        name: 'Email Microservice',
        repo: 'git@bitbucket.org:best-apps/email.microservice.git',
    },
    {
        name: 'FB Auth Microservice',
        repo: 'git@bitbucket.org:best-apps/facebook.auth.microservice.git',
    },
    {
        name: 'FB Graph Microservice',
        repo: 'git@bitbucket.org:best-apps/facebook.graph.microservice.git',
    },
    {
        name: 'Google Auth Microservice',
        repo: 'git@bitbucket.org:best-apps/google.auth.microservice.git',
    },
    {
        name: 'Twitter Auth Microservice',
        repo: 'git@bitbucket.org:best-apps/twitter.auth.microservice.git',
    },
    {
        name: 'Twilio Microservice',
        repo: 'git@bitbucket.org:best-apps/twilio.microservice.git',
    },
    {
        name: 'Stripe Microservice',
        repo: 'git@bitbucket.org:best-apps/stripe.microservice.git',
    },
    {
        name: 'PayPal Microservice',
        repo: 'git@bitbucket.org:best-apps/paypal.microservice.git',
    },
    {
        name: 'RapidAPI Microservice',
        repo: 'git@bitbucket.org:best-apps/rapidapi.microservice.git',
    }
];

export function generateCommands() {
    for (const command of commands) {
        command.callback = (state, answers, cb) => {
            copyRepoFlow(state, answers, command.repo, command.name, cb);
        }
    }
    return commands;
}
