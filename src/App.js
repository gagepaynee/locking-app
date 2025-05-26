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
  const [registered, setRegistered] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const unlockedAudioRef = useRef(new Audio(unlockedSound));
  // Track the latest value of audioEnabled for the WebSocket callback
  const audioEnabledRef = useRef(audioEnabled);
  const socketRef = useRef(null);
  const idRef = useRef('');

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

  // Keep the refs in sync with the latest state values
  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  useEffect(() => {
    idRef.current = clientId;
  }, [clientId]);

  useEffect(() => {
    const socket = new WebSocket(`wss://${process.env.REACT_APP_IP_ADDRESS}:${process.env.REACT_APP_SERVER_PORT}`);
    socketRef.current = socket;

    socket.addEventListener('message', (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.event === 'unlocked' && data.id === idRef.current) {
          setUnlocked(true);
          if (unlockedAudioRef.current && audioEnabledRef.current) {
            try {
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

  const registerLock = () => {
    if (!clientId || !socketRef.current) {
      return;
    }
    const socket = socketRef.current;
    const sendRegistration = () => {
      socket.send(JSON.stringify({ event: 'register', id: clientId }));
      setRegistered(true);
    };
    if (socket.readyState === WebSocket.OPEN) {
      sendRegistration();
    } else {
      socket.addEventListener('open', sendRegistration, { once: true });
    }
  };

  return (
    <div className={`App ${registered ? 'registered' : ''} ${unlocked ? 'unlocked' : ''}`}>
      {!audioEnabled && (
        <button onClick={enableAudio} className="enable-audio">Enable Audio</button>
      )}
      {!registered ? (
        <div className="register-form">
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Event ID"
          />
          <button onClick={registerLock}>Lock</button>
        </div>
      ) : (
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
      )}
    </div>
  );
}

export default App;
