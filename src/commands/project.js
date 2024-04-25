import { createProject } from '../project/index.js';

export function setupProjectCommand(program) {
    program.command('project')
        .description('Create a new project from predefined templates')
        .action(createProject);
}