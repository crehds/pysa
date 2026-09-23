import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from './Context';
import { BrowserRouter } from 'react-router';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </Provider>
);
