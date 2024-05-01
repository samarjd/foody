export const logUserAction = (action) => {
  fetch('http://localhost:4000/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action }),
    credentials: 'include',
  })
  .catch(error => console.error('Error logging action:', error.message));
};