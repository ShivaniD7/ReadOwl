import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import PDFReader from './components/PDFReader';
import EPUBReader from './components/EPUBReader';
import About from './About';
import Contact from './Contact';
import Layout from './Layout';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Shared Layout for Home, About, Contact */}
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* These routes stay outside layout if you don't want navbar */}
        <Route path="/pdf/:filename" element={<PDFReader />} />
        <Route path="/epub/:filename" element={<EPUBReader />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
