import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Loading } from './components/initLoading';

function App() {
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    return setTimeout(() => setLoading(true), 4100);
  }, []);

  return (
    <div className='App'>
      {isLoading ? (
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className='App-link'
            href='https://reactjs.org'
            target='_blank'
            rel='noopener noreferrer'
          >
            Learn React
          </a>
        </header>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default App;
