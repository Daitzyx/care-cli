import inquirer from 'inquirer';
import { exec } from 'child_process';
import chalk from 'chalk';

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
      const commitSuccessful = await handleGitCommit();
      if (commitSuccessful) {
        console.log(chalk.green('Now pushing to remote...'));
        exec('git push', handleGitResponse);
      }
      break;
    case 'push':
      await handleGitPush();
      break;
    case 'pull':
      exec('git pull', handleGitResponse);
      break;
    case 'merge':
      await handleGitMerge();
      break;
  }
}

async function handleGitMerge() {
  const branches = await getBranches();
  if (branches.length < 2) {
    console.log(chalk.yellow('Not enough branches available for a merge. At least two branches are needed.'));
    return;
  }

  const sourceBranchAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'sourceBranch',
      message: 'Select the source branch for the merge:',
      choices: branches
    }
  ]);

  const destinationBranches = branches.filter(branch => branch !== sourceBranchAnswer.sourceBranch);

  if (destinationBranches.length === 0) {
    console.log(chalk.yellow('No valid destination branches available.'));
    return;
  }

  const destinationBranchAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'destinationBranch',
      message: 'Select the destination branch for the merge:',
      choices: destinationBranches
    }
  ]);

  console.log(chalk.green(`Attempting to merge ${sourceBranchAnswer.sourceBranch} into ${destinationBranchAnswer.destinationBranch}...`));

  const mergeCommand = `git checkout ${destinationBranchAnswer.destinationBranch} && git merge ${sourceBranchAnswer.sourceBranch}`;
  exec(mergeCommand, handleGitResponse);
}



async function getBranches() {
  return new Promise((resolve, reject) => {
    exec('git branch -a', (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error fetching branches: ${error.message}`));
        reject(error);
      } else if (stderr) {
        console.error(chalk.red(`Error: ${stderr}`));
        reject(new Error(stderr));
      } else {
        const branches = stdout.split('\n').filter(line => line).map(line => line.trim().replace('* ', ''));
        resolve(branches);
      }
    });
  });
}

async function gitAddAll() {
  return new Promise((resolve, reject) => {
    exec('git add .', (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error adding changes to index: ${error.message}`));
        reject(error);
        return;
      }
      if (stderr) {
        console.error(chalk.red(`Error: ${stderr}`));
        reject(new Error(stderr));
        return;
      }
      console.log(chalk.green('Changes added to index.'));
      resolve();
    });
  });
}

async function handleGitCommit() {
  const hasChanges = await checkForChanges();
  if (!hasChanges) {
    console.log(chalk.yellow('No changes to commit.'));
    return false;
  }

  console.log(chalk.green('Adding changes to index...'));
  await gitAddAll();

  const commitTypes = [
    { name: 'Refactor', value: 'refact' },
    { name: 'Fix', value: 'fix' },
    { name: 'Style', value: 'style' },
    { name: 'Feature', value: 'feat' }
  ];

  const commitAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Select the type of change that you\'re committing:',
      choices: commitTypes
    },
    {
      type: 'input',
      name: 'message',
      message: 'Enter the commit message:',
      validate: input => input.trim() !== '' ? true : 'Commit message cannot be empty.'
    }
  ]);

  const commitCommand = `git commit -m "${commitAnswers.type}: ${commitAnswers.message}"`;
  console.log(chalk.green(`Executing command: ${commitCommand}`));

  return new Promise((resolve) => {
    exec(commitCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        console.error(chalk.red(`Git output: ${stderr}`));  
        resolve(false);
        return;
      }
      if (stderr) {
        console.error(chalk.red(`Error: ${stderr}`));
        resolve(false);
        return;
      }
      console.log(chalk.green('Commit successful:'), stdout);
      resolve(true);
    });
  });
}

async function handleGitPush() {
  console.log(chalk.blue('Checking if the branch is up to date with the remote...'));
  const isUpToDate = await checkIfBranchIsUpToDate();
  if (!isUpToDate) {
      console.log(chalk.yellow('Local branch is not up to date with remote. Pulling changes...'));
      const pullSuccess = await gitPull();
      if (!pullSuccess) {
          console.log(chalk.red('Failed to pull changes. Aborting push.'));
          return;
      }
  }

  console.log(chalk.green('Local branch is up to date. Pushing to remote...'));
  exec('git push', handleGitResponse);
}

async function checkIfBranchIsUpToDate() {
  return new Promise((resolve, reject) => {
      exec('git fetch && git status -uno', (error, stdout, stderr) => {
          if (error) {
              console.error(chalk.red(`Error checking branch status: ${error.message}`));
              reject(error);
              return;
          }
          if (stderr) {
              console.error(chalk.red(`Error: ${stderr}`));
              reject(new Error(stderr));
              return;
          }
          resolve(!stdout.includes('Your branch is behind'));
      });
  });
}

async function checkForChanges() {
  return new Promise((resolve, reject) => {
    exec('git status --porcelain', (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error checking for changes: ${error.message}`));
        reject(error);
        return;
      }
      if (stderr) {
        console.error(chalk.red(`Error: ${stderr}`));
        reject(new Error(stderr));
        return;
      }
      resolve(stdout.trim().length > 0);
    });
  });
}

async function gitPull() {
  return new Promise((resolve, reject) => {
      exec('git pull', (error, stdout, stderr) => {
          if (error) {
              console.error(chalk.red(`Error pulling changes: ${error.message}`));
              reject(error);
              return;
          }
          if (stderr) {
              console.error(chalk.red(`Error: ${stderr}`));
              reject(new Error(stderr));
              return;
          }
          console.log(chalk.green('Changes pulled successfully.'));
          resolve(true);
      });
  });
}

function handleGitResponse(error, stdout, stderr) {
  if (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    return;
  }
  if (stderr) {
    console.error(chalk.red(`Error: ${stderr}`));
    return;
  }
  console.log(chalk.green(stdout));
}
