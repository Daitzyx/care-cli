import { handleGitOperations } from '../git/index.js';

export function setupGitCommand(program) {
    program.command('git')
        .description('Git operations')
        .action(handleGitOperations);
}