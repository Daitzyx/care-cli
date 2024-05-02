import { program } from 'commander';
import inquirer from 'inquirer';
import { fetchIncompleteTasks, startOrContinueTimerForTask } from '../monday/index.js';

export function setupTasksCommand(program) {
  program
    .command('list-tasks')
    .description('List incomplete tasks from a specific Monday board')
    .requiredOption('-b, --board <boardId>', 'Specify the board ID')
    .action(async (options) => {
      const tasks = await fetchIncompleteTasks(options.board);
      
      if (tasks.length > 0) {
        inquirer.prompt([
          {
            type: 'list',
            name: 'selectedTask',
            message: 'Select a task to view details:',
            choices: tasks.map(task => ({ name: task.name, value: task.id }))
          }
        ]).then(async (answers) => {
          const selectedTaskId = answers.selectedTask;
          
          // Após selecionar a tarefa, pergunte se deseja iniciar o contador de tempo
          inquirer.prompt([
            {
              type: 'list',
              name: 'selectedOption',
              message: 'What would you like to do?',
              choices: ['View task details', 'Start timer']
            }
          ]).then(async (chosenOption) => {
            if (chosenOption.selectedOption === 'View task details') {
              console.log('Task details:', selectedTaskId);
              // Adicione aqui o código para exibir os detalhes da tarefa
            } else if (chosenOption.selectedOption === 'Start timer') {
              // Iniciar o contador de tempo para a tarefa selecionada
              await startOrContinueTimerForTask(selectedTaskId);
            }
          });
        });
      } else {
        console.log('No incomplete tasks found.');
      }
    });
}
