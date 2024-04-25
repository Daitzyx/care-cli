#!/usr/bin/env node
import figlet from "figlet";
import chalk from "chalk";
import { program } from 'commander';
import { setupProjectCommand } from './commands/project.js';
// import { setupGitCommand } from './commands/git.js';
// import { setupReactCommand } from './commands/react.js';

console.log(
  chalk.blue(figlet.textSync("Care CLI", { horizontalLayout: "full" }))
);

program
  .name('care')
  .description('Our own CLI for managing projects and all we need to code faster!')
  .version('1.0.0');

// Setup commands
setupProjectCommand(program);
// Uncomment the following lines if you want to enable these features
// setupGitCommand(program);
// setupReactCommand(program);

program.parse(process.argv);
