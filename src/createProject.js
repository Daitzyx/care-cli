import { exec, spawn } from 'child_process';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

async function updatePackageJson(projectPath, projectName) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  try {
    const packageData = await fs.readJson(packageJsonPath);
    packageData.name = projectName; // Atualiza o nome do projeto no package.json
    await fs.writeJson(packageJsonPath, packageData, { spaces: 2 });
    console.log(chalk.green('package.json updated successfully!'));
  } catch (error) {
    console.error(chalk.red(`Failed to update package.json: ${error}`));
  }
}

async function runNpmInstall(projectPath) {
  return new Promise((resolve, reject) => {
    const npmInstall = spawn('npm', ['install'], { cwd: projectPath, stdio: 'inherit', shell: true });

    npmInstall.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('Dependencies installed successfully!'));
        resolve();
      } else {
        console.error(chalk.red(`npm install failed with code ${code}`));
        reject(new Error('npm install failed'));
      }
    });

    npmInstall.on('error', (error) => {
      console.error(chalk.red(`Error during npm install: ${error.message}`));
      reject(error);
    });
  });
}


export async function createProject() {
  const templates = [
    { name: chalk.yellow('Basic Template'), value: 'C:\\Users\\natha\\Documents\\CLI\\basic-template' },
    { name: chalk.blue('Ready-to-Use Template'), value: 'C:\\Users\\natha\\Documents\\CLI\\ready-to-use-template' }
  ];

  const templateAnswer = await inquirer.prompt({
    type: 'list',
    name: 'template',
    message: 'Which template do you want to use?',
    choices: templates,
    transformer: (input, answer, flags) => {
      const color = input === 'Basic Template' ? chalk.blue : chalk.green;
      return flags.isFinal ? color.underline(input) : color(input);
    }
  });

  const nameAnswer = await inquirer.prompt({
    type: 'input',
    name: 'projectName',
    message: 'What is the name of your new project?',
  });

  const templatePath = templateAnswer.template;
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
