import { exec } from 'child_process';
import { handleGitResponse } from './gitHandlers.js';
import { checkForChanges, gitAddAll, gitPull } from './gitUtils.js';
import inquirer from 'inquirer';
import chalk from 'chalk';

export async function handleGitCommit() {
  const hasChanges = await checkForChanges();
  if (!hasChanges) {
    console.log(chalk.yellow('No changes to commit.'));
    return false;
  }
  await gitAddAll();
  // Continuação do commit aqui...
}

export async function handleGitPush() {
  // Lógica para git push...
}

export async function handleGitMerge() {
  // Lógica para git merge...
}

export async function handleGitPull() {
  await gitPull();
}
