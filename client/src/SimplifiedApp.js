import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SimpleTest from './components/SimpleTest';
import './App.css';

const SimplifiedApp = () => {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/test">Test</Link>
            </li>
          </ul>
        </nav>

        <div className="content-container">
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/test" element={<SimpleTest />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default SimplifiedApp; 