import chalk from 'chalk';

export function handleGitResponse(error, stdout, stderr) {
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
