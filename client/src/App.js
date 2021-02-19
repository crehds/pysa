// import './App.css';
import { useEffect, useState } from 'react';
import { Loading } from './components/initLoading';
import { GlobalStyle } from './styles/GlobalStyles';
import { Home } from './components/pages/Home';
// import './App.css';
function App() {
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    return setTimeout(() => setLoading(true), 4000);
  }, []);

  return (
    <div className='App'>
      <GlobalStyle />
      {isLoading ? <Home /> : <Loading />}
    </div>
  );
}

export default App;
