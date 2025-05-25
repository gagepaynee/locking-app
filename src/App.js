import React, { useEffect, useState } from 'react';
import './App.css';

/**
 * Connects to a WebSocket server and registers this client. When an
 * `unlocked` event matching this client's id is received the UI will
 * display a short message.
 */
function App() {
  const [clientId, setClientId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Generate a simple unique id for this client.
    const id = Math.random().toString(36).substring(2, 10);
    setClientId(id);

    const socket = new WebSocket('ws://localhost:3001');

    socket.addEventListener('open', () => {
      // Send register event to the server with the generated id
      socket.send(JSON.stringify({ event: 'register', id }));
    });

    socket.addEventListener('message', (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.event === 'unlocked' && data.id === id) {
          setMessage('Unlocked!');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Invalid message from server', err);
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Client ID: {clientId}</p>
        {message && <p>{message}</p>}
      </header>
    </div>
  );
}

export default App;
