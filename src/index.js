import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import PDFReader from './components/PDFReader';
import EPUBReader from './components/EPUBReader';
import About from './About';
import Contact from './Contact';
import Reviews from './Reviews';
import Discussions from './Discussions';
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
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/discussions" element={<Discussions />} />
        </Route>

        {/* These routes stay outside layout if you don't want navbar */}
        <Route path="/pdf/:filename" element={<PDFReader />} />
        <Route path="/epub/:filename" element={<EPUBReader />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
