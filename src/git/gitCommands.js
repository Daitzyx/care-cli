import { exec } from 'child_process';
import { promises as fs } from 'fs';

import { checkIfBranchIsUpToDate, gitAddAll, gitPull, checkForUncommittedChanges, checkForStagedChanges, execPromisify, isRebaseInProgress, checkBranchSyncStatus, synchronizeBranch } from './gitUtils.js';
import { executeGitPull, executeGitPush } from './gitExecute.js'

import inquirer from 'inquirer';
import chalk from 'chalk';

export async function handleGitCommit() {
  const hasChanges = await checkIfBranchIsUpToDate();
  if (!hasChanges) {
    console.log(chalk.yellow('No changes to commit.'));
    return false;
  }
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

export function handleGitPushError() {
  console.log(chalk.yellow('Detected push error due to non-fast-forward updates. Attempting to resolve...'));

  // Tentar um pull com rebase para integrar as mudanças do remoto
  exec('git pull --rebase', async (error, stdout, stderr) => {
    if (error && stderr.includes('could not apply')) {
      // Detecta a presença de conflitos durante o rebase
      console.error(chalk.bgRed('Conflicts detected during pull.'));
      console.log(chalk.yellow('Resolve all conflicts manually, then use the following options to proceed.'));

      // Chama a função para interagir com o usuário após resolver os conflitos
      await askUserAfterConflictResolution();
    } else if (!error) {
      console.log(chalk.green('Changes pulled successfully. Attempting to push again...'));
      executeGitPush(); // Tenta fazer o push novamente se não houver conflitos
    } else {
      console.error(chalk.red('Failed to pull changes:'), error.message);
      console.error(chalk.red(`Details: ${stderr}`));
    }
  });
}

async function hasUnresolvedConflicts() {
  const { stdout } = await execPromisify('git diff --name-only --diff-filter=U');
  if (!stdout) {
    return false;
  }
  const files = stdout.split('\n').filter(line => line.trim() !== '');
  for (let file of files) {
    if (await checkForConflictMarkers(file)) {
      return true;
    }
  }
  return false;
}

async function checkForConflictMarkers(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    // Regex para detectar as linhas de conflito do Git
    const conflictMarkerRegex = /^(<<<<<<< |=======|>>>>>>> )/m;
    return conflictMarkerRegex.test(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return false;
  }
}

async function askUserAfterConflictResolution() {
  let resolved = false;

  while (!resolved) {
    const { action } = await inquirer.prompt({
      name: 'action',
      type: 'list',
      message: 'Você resolveu todos os conflitos e está pronto para continuar?',
      choices: [
        { name: 'Continuar (isso tentará aplicar as mudanças e continuar o processo)', value: 'continue' },
        { name: 'Abortar (isso descartará as mudanças realizadas durante o rebase)', value: 'abort' }
      ]
    });


    if (action === 'continue') {
      if (await hasUnresolvedConflicts()) {
        console.log(chalk.red('Still unresolved conflicts. Please resolve them before continuing.'));
        continue;
      } else {
        console.log(chalk.green('Attempting to finalize and push changes...'));
        process.env.GIT_EDITOR = "echo";
        // await continueRebaseIfPossible();

        try {
          await new Promise((resolve, reject) => {
            exec('git add .', (error) => {
              if (error) {
                console.error(chalk.red(`Failed to add changes: ${error.message}`));
                reject(error);
              } else {
                console.log(chalk.green('All changes added, checking status...'));
                exec('git status --porcelain', (statusError, statusOutput) => {
                  if (statusError) {
                    console.error(chalk.red(`Error checking status: ${statusError.message}`));
                    reject(statusError);
                  }
                  const lines = statusOutput.split('\n');
                  const unstagedLines = lines.filter(line => line && !line.startsWith('A ') && !line.startsWith('M ') && !line.startsWith('D ') && !line.startsWith('R '));
                  if (unstagedLines.length > 0) {
                    unstagedLines.forEach(line => {
                      console.error(chalk.red(`Unstaged change: ${line}`));
                    });
                    reject(new Error('Not all changes are staged.'));
                  } else {
                    // console.log(chalk.green('All changes are staged, continuing rebase...'));
                    exec('git rebase --continue', (continueError, continueStdout, continueStderr) => {
                      if (continueError) {
                        console.error(chalk.red(`Rebase failed to continue: ${continueError.message}`));
                        console.error(chalk.red(`Details: ${continueStderr}`));
                        reject(continueError);
                      } else {
                        // console.log(chalk.green('Rebase continued successfully.'));
                        resolve();
                      }
                    });
                  }
                });
              }
            });
          });
          executeForcePushWithLease();
          resolved = true;

        } catch (error) {
          console.error(chalk.red('An error occurred during rebase continuation:'), error);
        }
      }

    } else if (action === 'abort') {
      exec('git rebase --abort', (error) => {
        if (error) {
          console.error(chalk.red(`Failed to abort rebase: ${error.message}`));
        } else {
          console.log(chalk.yellow('Rebase aborted successfully. Please check your repository.'));
        }
      });
    }
  }
}

// async function manageGitOperations() {
//   try {
//     console.log(chalk.green("Adding resolved files to the index..."));
//     const { stdout: addStdout, stderr: addStderr } = await execPromisify('git add .');
//     console.log(addStdout);
//     if (addStderr) console.log(chalk.yellow(`add stderr: ${addStderr}`));

//     console.log(chalk.green("Checking for unresolved conflicts..."));
//     const conflictCheck = await execPromisify('git diff --check');
//     if (conflictCheck.stdout.includes('conflict')) {
//       console.log(chalk.red('Unresolved conflicts remain. Please resolve them before continuing.'));
//       return;
//     }

//     console.log(chalk.green("Continuing rebase..."));
//     const { stdout: rebaseStdout, stderr: rebaseStderr } = await execPromisify('git rebase --continue');
//     if (rebaseStderr) {
//       console.log(chalk.yellow(`rebase stderr: ${rebaseStderr}`));
//       if (rebaseStderr.includes('could not apply')) {
//         console.log(chalk.red('Failed to apply changes. Manual intervention required.'));
//         return;
//       }
//     }
//     if (rebaseStdout) {
//       console.log(chalk.green(`rebase stdout: ${rebaseStdout}`));
//     }

//     if (!rebaseStdout.includes('Applying')) {
//       console.log(chalk.green('Rebase completed, attempting to push changes...'));
//       const { stdout: pushStdout } = await execPromisify('git push');
//       console.log(pushStdout);
//       console.log(chalk.green('Changes pushed successfully.'));
//     } else {
//       console.log(chalk.yellow('Rebase paused, additional conflicts detected.'));
//     }
//   } catch (error) {
//     console.error(chalk.red('Error during Git operations:'), error);
//     if (error.message.includes('non-fast-forward')) {
//       await execPromisify('git pull --rebase');
//       await execPromisify('git push');
//     }
//   }
// }

async function continueRebaseIfPossible() {
  const rebaseInProgress = await isRebaseInProgress();
  if (!rebaseInProgress) {
    console.log(chalk.yellow('No rebase in progress. Please start a rebase first.'));
    return;
  }

  try {
    const conflictsResolved = await checkForUnresolvedConflicts();
    if (!conflictsResolved) {
      console.log(chalk.red('Unresolved conflicts exist. Resolve them before continuing.'));
      return;
    }
    const { stdout, stderr } = await execPromisify('git rebase --continue');
    if (stderr || !stdout.includes('Rebase continued successfully.')) {
      console.error(chalk.red('Rebase failed to continue: '), stderr);
      return;
    }
    console.log(chalk.green('Rebase continued successfully.'), `Stdout: ${stdout}`);
  } catch (error) {
    console.error(chalk.red(`Rebase failed to continue: ${error.toString()}`));
  }
}


async function checkForUnresolvedConflicts() {
  try {
    // Usando 'git status --porcelain' para detectar conflitos de forma mais confiável.
    const { stdout } = await execPromisify('git status --porcelain');
    // Se houver linhas começando com 'UU', 'AA', 'DD', etc., indica conflitos não resolvidos.
    const unresolved = stdout.split('\n').some(line => line.startsWith('UU') || line.startsWith('AA') || line.startsWith('DD'));
    if (unresolved) {
      console.error(chalk.red('Unresolved conflicts exist. Resolve them before continuing.'));
    }
    return !unresolved; // Retorna false se houver conflitos, true se não houver.
  } catch (error) {
    console.error(chalk.red('Error checking for conflicts:'), error);
    return false; // Em caso de erro, assume que não pode prosseguir.
  }
}


// function checkForUnresolvedConflicts() {
//   return new Promise((resolve, reject) => {
//     exec('git diff --check', (error, stdout, stderr) => {
//       if (error) {
//         console.error(chalk.red(`Erro ao verificar conflitos: ${error.message}`));
//         reject(new Error(`Erro ao verificar conflitos: ${error.message}`));
//         return;
//       }

//       if (stdout.includes('conflict')) {
//         console.error(chalk.red('Ainda existem conflitos não resolvidos. Resolva esses conflitos antes de continuar.'));
//         resolve(false);  // Indica que há conflitos não resolvidos
//         return;
//       }

//       resolve(true);  // Indica que não há conflitos não resolvidos
//     });
//   });
// }


function executeForcePushWithLease() {
  console.log(chalk.blue('Attempting to push... Please WAIT!'));
  exec('git push --force-with-lease', (pushError, pushStdout, pushStderr) => {
    if (pushError) {
      console.error(chalk.red('Force push failed:'), pushError.message);
      console.error(chalk.red(`Details: ${pushStderr}`));
    } else {
      console.log(chalk.green('Push successful.'));
    }
  });
}

export async function handleGitPush() {
  // console.log(chalk.blue('Checking for unstaged changes...'));
  const hasUnstagedChanges = await checkForUncommittedChanges();

  if (hasUnstagedChanges) {
    console.error(chalk.red('Unstaged changes detected. Please commit or stash your changes.'));
    return; // Aborta o push se houver mudanças não commitadas
  }

  // console.log(chalk.blue('Checking for staged but uncommitted changes...'));
  const hasStagedChanges = await checkForStagedChanges();

  if (hasStagedChanges) {
    console.error(chalk.red('Staged changes detected. Please commit your changes.'));
    return; // Aborta o push se houver mudanças staged não commitadas
  }

  console.log(chalk.blue('Checking if branch is up to date...'));
  const isUpToDate = await checkIfBranchIsUpToDate();

  if (!isUpToDate) {
    console.log(chalk.yellow('Local branch is not up to date with remote. Attempting to synchronize...'));
    const syncResult = await synchronizeBranch(); // Este método já deve lidar com o pull e possível resolução de conflitos
    if (!syncResult.success) {
      console.error(chalk.red('Failed to synchronize the branch with remote. Please resolve any conflicts.'));
      return; // Aborta o push se não for possível sincronizar
    }
  }

  executeGitPush(); // Executa o push se todas as verificações passarem
}

export async function handleGitMerge() {
  // Lógica para git merge...
}

export async function handleGitPull() {
  const { autoResolve } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'autoResolve',
      message: 'Attempt to automatically resolve conflicts?',
      default: false // Por padrão, não tenta resolver automaticamente
    }
  ]);

  await gitPull(autoResolve);
}

export async function stashChanges() {
  return new Promise((resolve, reject) => {
    exec('git stash push -m "Stashed by CLI before pulling"', (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error stashing changes: ${error.message}`));
        reject(new Error(`Error stashing changes: ${error.message}`));
        return;
      }
      console.log(chalk.green('Changes stashed successfully.'));
      resolve(true);
    });
  });
}

export async function handleCheckSync() {
  await checkBranchSyncStatus();
}
