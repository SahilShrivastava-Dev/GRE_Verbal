import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddWord from './pages/AddWord';
import VocabularyList from './pages/VocabularyList';
import DailyQuiz from './pages/DailyQuiz';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-word" element={<AddWord />} />
          <Route path="/vocabulary" element={<VocabularyList />} />
          <Route path="/quiz" element={<DailyQuiz />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

