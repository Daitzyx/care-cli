#!/usr/bin/env node
import figlet from "figlet";
import chalk from "chalk";
import { program } from 'commander';
import { createProject } from './createProject.js';
import { handleGitOperations } from './git.js';
import { createInteractiveElement } from './react/createInteractiveElement.js';

console.log(
  chalk.blue(figlet.textSync("Care CLI", { horizontalLayout: "full" }))
);

program
  .name('care')
  .description('Our own cli for managing projects en all we need to code faster!')
  .version('1.0.0');

program.command('project')
  .description('Create a new project')
  .action(() => {
    createProject();
  });

// program.command('git')
//   .description('Git operations')
//   .action(() => {
//     handleGitOperations();
//   });

// program.command('react')
//   .description('Create a new component or page in react')
//   .action(() => {
//     createInteractiveElement();
//   });



program.parse(process.argv);