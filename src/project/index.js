import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { updatePackageJson } from './updatePackageJson.js';
import { runNpmInstall } from './npmInstall.js';

export async function createProject() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const templates = [
    { name: chalk.yellow('Basic Template'), value: 'src/projectTemplates/basic-template' },
    { name: chalk.blue('Ready-to-Use Template'), value: 'src/projectTemplates/ready-to-use-template' }
  ];

  const templateAnswer = await inquirer.prompt({
    type: 'list',
    name: 'template',
    message: 'Which template do you want to use?',
    choices: templates,
  });

  const nameAnswer = await inquirer.prompt({
    type: 'input',
    name: 'projectName',
    message: 'What is the name of your new project?',
  });

  const templatePath = path.resolve(__dirname, '..', '..', templateAnswer.template); // Ajuste aqui
  const targetPath = path.resolve(nameAnswer.projectName);

  try {
    await fs.copy(templatePath, targetPath);
    console.log(chalk.green(`Project ${nameAnswer.projectName} created successfully at ${targetPath}`));
    await updatePackageJson(targetPath, nameAnswer.projectName);
    await runNpmInstall(targetPath);
  } catch (error) {
    console.error(chalk.red(`Error creating project: ${error}`));
  }
}
