import React from 'react';
import { BrowserRouter as Router, Route, Routes , Switch} from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';


function App() {
  return (
    <Router>
      <div className="App">
      <Routes>
        <Route exact path="/" element={<HomePage />} />
      </Routes>
      </div>
    </Router>
  );
}

export default App;

