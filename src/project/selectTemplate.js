import inquirer from 'inquirer';
import chalk from 'chalk';

const templates = [
    { name: chalk.yellow('Basic Template'), value: './src/projectTemplates/basic-template'},
    { name: chalk.blue('Ready-to-Use Template'), value: './src/projectTemplates/ready-to-use-template' }
  ];

export async function selectTemplate() {
    const templateAnswer = await inquirer.prompt({
        type: 'list',
        name: 'template',
        message: 'Which template do you want to use?',
        choices: templates,
    });
    return templateAnswer.template;
}
