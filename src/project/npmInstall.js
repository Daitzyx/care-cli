import { spawn } from 'child_process';
import chalk from 'chalk';

export async function runNpmInstall(projectPath) {
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
