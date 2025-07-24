import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ImageViewer from './pages/ImageViewer';
import UploadPage from './pages/UploadPage';

function App() {
  return (
    <Router>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        <Header />
        <Container component='main' sx={{ flexGrow: 1, py: 3 }}>
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/upload' element={<UploadPage />} />
            <Route path='/image/:id' element={<ImageViewer />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
