
import { handleGitPushError } from './gitCommands.js'
import chalk from 'chalk';
import { exec } from 'child_process';


export function executeGitPush() {
    console.log(chalk.bgCyan(chalk.bgGrey('Executing git push...')));
    exec('git push', (error, stdout, stderr) => {
        if (error) {
            if (stderr.includes('rejected') && stderr.includes('non-fast-forward')) {
                handleGitPushError();
                // console.log(chalk.bgRed("Conflicts detected during pull."))
            } else {
                console.error(chalk.red('Push failed:'), error.message);
                console.error(chalk.red(`Details: ${stderr}`));
            }
            return;
        }
        console.log(chalk.green('Push successful.'));
    });
}


export async function executeGitPull(autoResolve = false) {
    let command = 'git pull';
    if (autoResolve) {
        command += ' --rebase'; // Opcional: adicionar '--rebase' para rebase automático durante o pull
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(chalk.red(`Pull failed: ${error.message}`));
            console.error(chalk.red(`Details: ${stderr}`));
            reject(false); // Indica falha no pull
        } else if (stderr.includes('CONFLICT')) {
            // console.error(chalk.red('Conflicts detected during pull.'));

            if (autoResolve) {
                // Implementar lógica de resolução automática aqui
            }
            reject(false); // Indica falha no pull devido a conflitos
        } else {
            console.log(chalk.green('Pull successful.'));
            console.log(chalk.green(stdout));
            resolve(true); // Indica sucesso no pull
        }
    });
}