import chalk from 'chalk';

export function handleGitResponse(error, stdout, stderr) {
  // console.log('error:', error);
  // console.log('stdout:', stdout);
  // console.log('stderr:', stderr);

  if (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    return;
  }

  const knownErrorPatterns = ["error:", "fatal:"];
  const hasRealError = stderr.split('\n').some(line =>
    knownErrorPatterns.some(pattern => line.toLowerCase().includes(pattern)));

  if (hasRealError && stderr.split(' ')[0] !== "To") {
    console.error(chalk.red(`Error: ${stderr}`));
    return;
  }

  if (stdout) {
    console.log(chalk.green(stdout));
  }
  if (stderr && !hasRealError) {
    console.log(chalk.grey(stderr));
  }
  
  if (stderr.split(' ')[0] === "To") {
    console.log(chalk.cyanBright('Operation successful!'));
  }
}