import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Delete, Visibility, Refresh, CloudUpload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService, ImageData } from '../services/api';

const Dashboard: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await apiService.getImages();
      setImages(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch images');
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteImage(id);
      setImages(images.filter((img) => img.id !== id));
    } catch (err) {
      setError('Failed to delete image');
      console.error('Error deleting image:', err);
    }
  };

  const handleView = (id: string) => {
    navigate(`/image/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'Uploading';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Typography variant='h4' component='h1'>
          Image Dashboard
        </Typography>
        <Box>
          <Button
            variant='contained'
            startIcon={<Refresh />}
            onClick={fetchImages}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant='contained'
            startIcon={<CloudUpload />}
            onClick={() => navigate('/upload')}
          >
            Upload New Image
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {images.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant='h6' textAlign='center' color='text.secondary'>
              No images uploaded yet
            </Typography>
            <Box textAlign='center' mt={2}>
              <Button
                variant='contained'
                startIcon={<CloudUpload />}
                onClick={() => navigate('/upload')}
              >
                Upload Your First Image
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {images.map((image) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardMedia
                  component='img'
                  height='200'
                  image={image.originalUrl}
                  alt={image.filename}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant='h6' noWrap>
                    {image.filename}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    gutterBottom
                  >
                    Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}
                  </Typography>

                  <Box display='flex' alignItems='center' gap={1} mb={2}>
                    <Chip
                      label={getStatusText(image.status)}
                      color={getStatusColor(image.status) as any}
                      size='small'
                    />
                    {image.status === 'processing' && (
                      <CircularProgress size={16} />
                    )}
                  </Box>

                  <Box display='flex' gap={1}>
                    <Tooltip title='View Details'>
                      <IconButton
                        size='small'
                        onClick={() => handleView(image.id)}
                        color='primary'
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Delete Image'>
                      <IconButton
                        size='small'
                        onClick={() => handleDelete(image.id)}
                        color='error'
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
