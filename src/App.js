import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons'
import unlockedSound from './media/unlocked.wav';

/**
 * Connects to a WebSocket server and registers this client. When an
 * `unlocked` event matching this client's id is received the UI will
 * display a short message.
 */
function App() {
  const [clientId, setClientId] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const unlockedAudioRef = useRef(new Audio(unlockedSound));
  // Track the latest value of audioEnabled for the WebSocket callback
  const audioEnabledRef = useRef(audioEnabled);

  const enableAudio = () => {
    if (unlockedAudioRef.current) {
      unlockedAudioRef.current.play().then(() => {
        unlockedAudioRef.current.pause();
        setAudioEnabled(true);
      }).catch(() => {
        // Even if playback fails, we consider audio enabled
        setAudioEnabled(true);
      });
    } else {
      setAudioEnabled(true);
    }
  };

  // Keep the ref in sync with the latest audioEnabled state
  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

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
          if (unlockedAudioRef.current && audioEnabledRef.current) {
            try {
              console.log('made it');
              unlockedAudioRef.current.play();
            } catch (e) {
              // ignore playback errors in unsupported environments
            }
          }
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
      {!audioEnabled && (
        <button onClick={enableAudio} className="enable-audio">Enable Audio</button>
      )}
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
