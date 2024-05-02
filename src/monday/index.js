import axios from 'axios';

// Substitua 'YOUR_API_KEY' pelo seu token de API do Monday
const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjM1MzI5OTk4NSwiYWFpIjoxMSwidWlkIjo1NTYwNzY3MSwiaWFkIjoiMjAyNC0wNC0yOVQxNDoyNjoxNy42NTZaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjAxMzkxMTcsInJnbiI6InVzZTEifQ.Yya3fwg5_iM1JWB3AwlxttLnC38Xjkgg4AW-RYXqlp8';
const apiUrl = 'https://api.monday.com/v2';


export async function fetchIncompleteTasks(boardId) {
  const query = `query {
    boards(ids: 6023302265) {
      name
      state
      permissions
      items_page {
        items {
          id
          name
          state
        }
      }
    }
  }`;

  try {
    const response = await axios.post(apiUrl, { query }, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
  
    if (response.data && response.data.data && response.data.data.boards && response.data.data.boards.length > 0) {
      const board = response.data.data.boards[0];
      if (board.items_page && board.items_page.items) {
        return board.items_page.items.filter(task => task.state !== 'done');
      } else {
        console.log('No items found in the response.');
        return [];
      }
    } else {
      console.log('Unexpected API response:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
  
}

export async function fetchTasksByUser(boardId, userId) {
  const query = `query {
    boards(ids: ${boardId}) {
      name
      state
      permissions
      items_page {
        items {
          id
          name
          creator {
            id
            name
          }
        }
      }
    }
  }`;

  try {
    const response = await axios.post(apiUrl, { query }, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.data && response.data.data.boards) {
      const allTasks = response.data.data.boards[0];
      console.log(allTasks)
      if (allTasks) {
        const tasksByUser = allTasks.items_page.items.filter(task => {
          console.log('Task creator:', task);
          return task.creator.id === userId;
        });
        console.log('Tasks by user:', tasksByUser);
        return tasksByUser;
      } else {
        console.log('No tasks found.');
        return [];
      }
    } else {
      console.log('Unexpected API response:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}


export async function fetchAllTasks(boardId) {
  const query = `query {
    boards(ids: ${boardId}) {
      items_page {
        items () {
          id
          name
          creator {
            id
            name
          }
        }
      }
    }
  }`;

  try {
    const response = await axios.post(apiUrl, { query }, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.data && response.data.data.boards) {
      return response.data.data.boards[0].items;
    } else {
      console.log('Unexpected API response:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}


export async function startOrContinueTimerForTask(taskId = 6364626409, boardId = 6023302265) {
  const query = `
    query {
      items(ids: ${taskId}) {
        column_values(ids: ["controle_de_tempo"]) {
          id
          value
        }
      }
    }
  `;

  try {
    const response = await axios.post(apiUrl, { query }, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors);
      return false;
    }

    if (response.data && response.data.data && response.data.data.items && response.data.data.items.length > 0) {
      const columnValues = response.data.data.items[0].column_values;
      const timeTrackingColumn = columnValues.find(col => col.id === "controle_de_tempo");
      if (timeTrackingColumn) {
        const currentTime = Math.floor(Date.now() / 1000); // Get current Unix timestamp in seconds
        const mutationQuery = `
          mutation {
            change_column_value (
              boardId: ${boardId},
              itemId: ${taskId},
              columnId: "controle_de_tempo",
              value: "{\\"running\\":true}"
            ) {
              id
            }
          }
        `;

        try {
          const mutationResponse = await axios.post(apiUrl, { query: mutationQuery }, {
            headers: {
              'Authorization': apiKey,
              'Content-Type': 'application/json'
            }
          });
console.log(mutationResponse, "TESTE MUUU")
          if (mutationResponse.data && mutationResponse.data.data && mutationResponse.data.data.change_column_value) {
            console.log('Timer continued/started for task:', taskId);
            return true;
          } else {
            if (mutationResponse.data.errors) {
              console.error('GraphQL Mutation Errors:', mutationResponse.data.errors);
            }
            console.error('Failed to continue/start timer for task:', taskId);
            return false;
          }
        } catch (error) {
          console.error('Error in mutation:', error.message);
          return false;
        }
      } else {
        console.error('Time tracking column not found for task:', taskId);
        return false;
      }
    } else {
      console.error('Failed to retrieve item details for task:', response);
      return false;
    }
  } catch (error) {
    console.error('Network or Axios error:', error.message);
    throw error;
  }
}
