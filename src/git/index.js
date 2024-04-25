import inquirer from 'inquirer';
import chalk from 'chalk';
import { handleGitCommit, handleGitPush, handleGitMerge, handleGitPull } from './gitCommands.js';

export async function handleGitOperations() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'operation',
      message: 'Select the Git operation:',
      choices: ['commit', 'commit & push', 'push', 'pull', 'merge']
    }
  ]);

  switch (answers.operation) {
    case 'commit':
      await handleGitCommit();
      break;
    case 'commit & push':
      await handleGitCommit() && await handleGitPush();
      break;
    case 'push':
      await handleGitPush();
      break;
    case 'pull':
      await handleGitPull();
      break;
    case 'merge':
      await handleGitMerge();
      break;
  }
}
