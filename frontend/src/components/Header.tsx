import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { CloudUpload, Dashboard, Home } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography
          variant='h6'
          component='div'
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Smart Uploader + Lambda Annotator
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color='inherit'
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: isActive('/')
                ? 'rgba(255, 255, 255, 0.1)'
                : 'transparent',
            }}
          >
            Dashboard
          </Button>

          <Button
            color='inherit'
            startIcon={<CloudUpload />}
            onClick={() => navigate('/upload')}
            sx={{
              backgroundColor: isActive('/upload')
                ? 'rgba(255, 255, 255, 0.1)'
                : 'transparent',
            }}
          >
            Upload
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
