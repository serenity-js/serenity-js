#!/usr/bin/env ts-node

/*
 * Implemented after cz-customizable standalone.js, with an override to avoid the problem with "prepared commits"
 * introduced in the below PR not being possible to disable:
 *  https://github.com/leoforfree/cz-customizable/pull/122
 *
 * The override can be removed when the following PR is merged:
 *  https://github.com/leoforfree/cz-customizable/pull/196
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');
const inquirer = require('inquirer');   // transitive dependency of cz-customizable

const app = require('cz-customizable');
const log = require('cz-customizable/lib/logger');
/* eslint-enable @typescript-eslint/no-var-requires */

log.info('cz-customizable standalone version');

const commit = (commitMessage) => {
    try {
        execSync(`git commit -m "${commitMessage}"`, { stdio: [0, 1, 2] });
    } catch (error) {
        log.error('>>> ERROR', error.error);
    }
};

app.prompter({
    prompt(questions) {
        return inquirer.prompt(questions.map(question => {
            if (question.name === 'subject' || question.name === 'body') {
                delete question.default;
            }
            return question;
        }))
    }
}, commit);
