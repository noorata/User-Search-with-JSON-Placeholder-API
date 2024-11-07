import { errorMessage } from '../const.js';

export async function fetchUsers() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    console.log('Status:', response.status);

    if (response.status === 200) {
      const data = await response.json();
      return data;
    } else if (response.status === 400) {
      displayError('Bad Request: Please check your request and try again.');
    } else if (response.status === 401) {
      displayError('Unauthorized: Please log in to access this information.');
    } else {
      displayError(
        `An error occurred while fetching data. Response status: ${response.status}`
      );
    }
  } catch (error) {
    displayError('An error occurred while fetching data.');
    console.error('Error fetching users:', error);
  }
  return [];
}
//error messages from the displayError function appear in the HTML element with id="errorMessage"
function displayError(message) {
  if (errorMessage) {
    errorMessage.textContent = message;
    errorMessage.classList.add('error');
  } else {
    console.error('Error element not found:', message);
  }
}
