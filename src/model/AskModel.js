import inquirer from "inquirer";

export default class AskModel {
    static ask(prompt, callback, failCallback) {
        inquirer
            .prompt(prompt)
            .then(async (answers) => {
                callback && callback(answers);
            })
            .catch((error) => {
                console.log('INTERNAL ERROR', error, prompt);
                failCallback && failCallback(prompt, error);
            });
    }
}
