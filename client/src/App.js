import logo from './logo.svg';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Main from './components/main';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        {
          <div>
            <Main />
          </div>
        }
      </div>
    </BrowserRouter>
  );
}

export default App;
