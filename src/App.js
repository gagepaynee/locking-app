import React, { useEffect, useState } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons'

/**
 * Connects to a WebSocket server and registers this client. When an
 * `unlocked` event matching this client's id is received the UI will
 * display a short message.
 */
function App() {
  const [clientId, setClientId] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    // Generate a simple unique id for this client.
    const id = Math.random().toString(36).substring(2, 10);
    setClientId(id);

    const socket = new WebSocket(`wss://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}`);

    socket.addEventListener('open', () => {
      // Send register event to the server with the generated id
      socket.send(JSON.stringify({ event: 'register', id }));
    });

    socket.addEventListener('message', (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.event === 'unlocked' && data.id === id) {
          setUnlocked(true);
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
    <div className={`App ${unlocked ? 'unlocked' : ''}`}>
      <div>
      <FontAwesomeIcon
        icon={unlocked ? faLockOpen : faLock}
        size='9x'
        inverse
        aria-label={unlocked ? 'unlocked' : 'locked'}
      />
      <header className="App-header">
        <p>Client ID: {clientId}</p>
      </header>
      </div>

    </div>
  );
}

export default App;
