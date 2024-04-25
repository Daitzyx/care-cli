import inquirer from 'inquirer';

export async function askProjectName() {
    const nameAnswer = await inquirer.prompt({
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your new project?',
  });
  return nameAnswer.projectName; 
}