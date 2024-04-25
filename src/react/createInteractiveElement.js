import inquirer from 'inquirer';
import { createElement } from '../createElement.js'; 
import chalk from 'chalk';
import path from 'path';

export async function createInteractiveElement() {
  const questions = [
    {
      type: 'list',
      name: 'type',
      message: 'What do you want to create?',
      choices: [
        { name: 'Component', value: 'component' },
        { name: 'Page', value: 'page' }
      ]
    },
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name for the element:',
      validate: input => !!input || 'Name cannot be empty.'
    },
    {
      type: 'input',
      name: 'directory',
      message: 'Enter the directory for the element (relative to src/):',
      default: answers => `src/${answers.type}s`, 
      validate: input => !!input || 'Directory cannot be empty.'
    }
  ];

  const answers = await inquirer.prompt(questions);

  // Build the full path for the element
  const fullPath = path.join(answers.directory, answers.name);

  // Call the createElement function
  createElement(answers.type, answers.name, fullPath);
  console.log(chalk.green(`Successfully created ${answers.type}: ${answers.name} at ${fullPath}`));
}

