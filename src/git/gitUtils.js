import { exec } from 'child_process';
import chalk from 'chalk';
import { executeGitPull, executeGitPush } from './gitExecute.js'

export async function checkBranchSyncStatus(branchName = 'main') {
  return new Promise((resolve, reject) => {
    exec('git fetch', (fetchError) => {
      if (fetchError) {
        console.error(chalk.red(`Error fetching from remote: ${fetchError.message}`));
        reject(new Error(`Error fetching from remote: ${fetchError.message}`));
        return;
      }

      // Check if there are remote changes that are not in local
      exec(`git rev-list --count HEAD...origin/${branchName}`, (error, result, stderr) => {
        if (error) {
          console.error(chalk.red(`Error checking sync status: ${error.message}`));
          reject(new Error(`Error checking sync status: ${error.message}`));
          return;
        }

        const [ahead, behind] = result.trim().split('\t');
        resolve({ ahead: parseInt(ahead, 10), behind: parseInt(behind, 10) });
      });
    });
  });
}



export async function checkIfBranchIsUpToDate() {
  return new Promise((resolve, reject) => {
    exec('git fetch', (fetchError) => {
      if (fetchError) {
        console.error(chalk.red(`Error fetching latest refs from remote: ${fetchError.message}`));
        reject(new Error(`Error fetching latest refs from remote: ${fetchError.message}`));
        return;
      }
      exec('git rev-parse HEAD', (error, localHead, stderr) => {
        if (error) {
          console.error(chalk.red(`Error fetching local HEAD: ${error.message}`));
          reject(new Error(`Error fetching local HEAD: ${error.message}`));
          return;
        }

        exec(`git ls-remote origin HEAD`, (error, remoteHead, stderr) => {
          if (error) {
            console.error(chalk.red(`Error fetching remote HEAD: ${error.message}`));
            reject(new Error(`Error fetching remote HEAD: ${error.message}`));
            return;
          }

          const remoteHeadHash = remoteHead.split('\t')[0]; // Definição de remoteHeadHash
          // console.log(`Local HEAD hash: ${localHead.trim()}`);
          // console.log(`Remote HEAD hash: ${remoteHeadHash.trim()}`);

          if (localHead.trim() === remoteHeadHash.trim()) {
            console.log(chalk.green('Branch is up to date with remote.'));
            resolve(true);
          } else {
            // console.log(chalk.yellow('Local branch is not up to date with remote.'));
            resolve(false);
          }
        });
      });
    });
  });
}

export async function gitAddAll() {
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

export async function gitPull(autoResolve = false) {
  return new Promise((resolve, reject) => {
    // Verificar primeiro por mudanças locais não comitadas
    exec('git status --porcelain', (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error checking git status: ${error.message}`));
        reject(new Error(`Error checking git status: ${error.message}`));
        return;
      }
      if (stdout) {
        console.error(chalk.red('Local changes detected. Please commit or stash them before pulling.'));
        resolve(false); // Indica que não é seguro fazer o pull
        return;
      }

      // Se não há mudanças locais, prosseguir com o pull
      exec('git pull', (error, stdout, stderr) => {
        if (error) {
          console.error(chalk.red(`Error pulling changes: ${error.message}`));
          reject(new Error(`Error pulling changes: ${error.message}`));
          return;
        }

        if (stderr.includes('CONFLICT')) {
          console.error(chalk.red(`Conflicts detected.`));
          if (autoResolve) {
            // Tenta resolver conflitos automaticamente
            console.log(chalk.yellow('Attempting automatic conflict resolution...'));
            exec('git merge-tool', (error) => {
              if (error) {
                console.error(chalk.red(`Automatic conflict resolution failed: ${error.message}`));
                reject(new Error(`Automatic conflict resolution failed: ${error.message}`));
                return;
              }
              console.log(chalk.green('Conflicts resolved automatically.'));
              resolve(true);
            });
          } else {
            // Informa ao usuário para resolver conflitos manualmente
            console.log(chalk.yellow('Please resolve conflicts manually.'));
            resolve(false); // Retorna false para indicar conflitos não resolvidos
          }
          return;
        }

        console.log(chalk.green('Changes pulled successfully.'));
        resolve(true);
      });
    });
  });
}



export async function checkForUncommittedChanges() {
  return new Promise((resolve, reject) => {
    exec('git status --porcelain', (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error checking git status: ${error.message}`));
        reject(new Error(`Error checking git status: ${error.message}`));
        return;
      }
      if (stdout) {
        resolve(true); // Há mudanças não commitadas
      } else {
        resolve(false); // Não há mudanças não commitadas
      }
    });
  });
}

export async function checkForStagedChanges() {
  return new Promise((resolve, reject) => {
    exec('git diff --cached --quiet', (error, stdout, stderr) => {
      if (error && error.code === 1) {
        // Exit status 1 means there are staged changes
        console.log(chalk.blue('Staged changes found.'));
        resolve(true);
      } else if (error) {
        // Other errors should be handled as actual errors
        console.log(chalk.red('Error checking staged changes:'), error.message);
        reject(new Error('Error checking staged changes'));
      } else {
        // No staged changes
        // console.log(chalk.blue('No staged changes found.'));
        resolve(false);
      }
    });
  });
}

export async function checkForCommitsToPush() {
  return new Promise((resolve, reject) => {
    exec('git cherry -v', (error, stdout, stderr) => {
      if (error) {
        console.log(chalk.red('Error checking commits to push:'), error.message);
        reject(new Error('Error checking commits to push'));
      } else {
        resolve(stdout.trim() !== ''); // If output is not empty, there are commits to push
      }
    });
  });
}

export async function safeGitPull() {
  return new Promise((resolve, reject) => {
    // Primeiro, verifica se há mudanças não commitadas
    exec('git status --porcelain', (error, stdout, stderr) => {
      if (stdout) {
        console.log(chalk.yellow('Local changes detected. Please commit or stash them before pulling.'));
        resolve(false); // Retorna false indicando que não é seguro fazer o pull
        return;
      }

      // Se não há mudanças não commitadas, faz o pull
      exec('git pull', (error, stdout, stderr) => {
        if (error) {
          console.error(chalk.red(`Error pulling changes: ${error.message}`));
          reject(new Error(`Error pulling changes: ${error.message}`));
          return;
        }
        console.log(chalk.green('Changes pulled successfully.'));
        resolve(true);
      });
    });
  });
}

export async function handleConflictResolution() {
  const conflicts = await checkForConflicts();
  if (conflicts) {
    const { openEditor } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'openEditor',
        message: 'Conflicts detected. Do you want to open the files in the editor to resolve them?',
        default: true
      }
    ]);

    if (openEditor) {
      openFilesInEditor();
    } else {
      console.log(chalk.yellow('Please resolve the conflicts manually.'));
    }
  }
}

function openFilesInEditor() {
  exec("git diff --name-only --diff-filter=U", (error, stdout, stderr) => {
    if (stdout) {  // Verifica se há saída, o que indica arquivos com conflitos
      console.log(chalk.green('Opening files with conflicts in editor...'));
      exec(`code ${stdout.replace(/\n/g, ' ')}`); // Abre no VS Code, substitua 'code' se necessário
    }
  });
}

function checkForConflicts() {
  return new Promise((resolve, reject) => {
    exec("git diff --name-only --diff-filter=U", (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Error checking for conflicts: ${error.message}`));
        reject(new Error(`Error checking for conflicts: ${error.message}`));
        return;
      }
      if (stderr) {
        console.error(chalk.red(`Error: ${stderr}`));
        reject(new Error(stderr));
        return;
      }
      if (stdout.trim()) {
        resolve(true);  // Existem conflitos
      } else {
        resolve(false); // Não existem conflitos
      }
    });
  });
}

export async function synchronizeBranch() {
  const branchName = await getCurrentBranch();
  const { ahead, behind } = await checkBranchSyncStatus(branchName);

  if (ahead > 0 && behind === 0) {
    console.log(`You have ${ahead} commits to push.`);
    return { success: true };
  }

  if (behind > 0) {
    console.log(`Your branch is behind by ${behind} commits. Pulling changes...`);
    const pullSuccess = await executeGitPull(true); // Assume resolução automática
    if (!pullSuccess) {
      console.error(chalk.red('Failed to pull changes.'));
      return { success: false };
    }
    console.log(chalk.green('Branch synchronized with remote.'));
  }

  return { success: true };
}

function getCurrentBranch() {
  return new Promise((resolve, reject) => {
    exec('git rev-parse --abbrev-ref HEAD', (error, stdout, stderr) => {
      if (error) {
        reject(new Error('Failed to fetch current branch name.'));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

export async function isRebaseInProgress() {
  return new Promise((resolve, reject) => {
    exec('git status', (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Erro ao verificar o status do Git: ${error.message}`));
        return;
      }
      resolve(stdout.includes('rebase in progress'));
    });
  });
}

export async function execPromisify(command, options = {}) {
  const defaultOptions = { env: { ...process.env, GIT_EDITOR: "echo" } };
  const finalOptions = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    exec(command, finalOptions, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command failed: ${command}`, error);
        reject(new Error(`Error executing '${command}': ${error.message}, Stderr: ${stderr}`));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}