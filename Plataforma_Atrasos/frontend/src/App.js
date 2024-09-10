import React, { useState, useEffect } from 'react';

function App() {
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/test-connection')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setConnectionStatus(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>Connection Status:</h1>
      {connectionStatus ? (
        <div>
          <p>{connectionStatus.message}</p>
          <p>Result: {connectionStatus.result}</p>
        </div>
      ) : (
        <p>Checking connection...</p>
      )}
    </div>
  );
}

export default App;