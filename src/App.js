import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock } from '@fortawesome/free-solid-svg-icons'

function App() {
  return (
    <div className="App">
      <FontAwesomeIcon icon={faLock} size='10x' inverse/>
    </div>
  );
}

export default App;
