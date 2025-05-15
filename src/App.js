import React, { useState } from 'react';
import './App.css';
import RVToolsParser from './components/RVToolsParser';
import InfraProvision from './components/InfraProvision';
import MainNavigation from './components/MainNavigation';

function App() {
  const [activeView, setActiveView] = useState('costEstimation');

  return (
    <div className="App">
      <header className="App-header">
        <h2>MetaPort: VMWare to Multi-Cloud AI-Powered Migration</h2>
        <MainNavigation activeView={activeView} setActiveView={setActiveView} />
      </header>
      <main>
        {activeView === 'costEstimation' && <RVToolsParser />}
        {activeView === 'infraProvision' && <InfraProvision />}
      </main>
      <footer>
        <p>Upload RVTools Excel exports, parse to JSON, and submit to AWS Lambda</p>
      </footer>
    </div>
  );
}

export default App;