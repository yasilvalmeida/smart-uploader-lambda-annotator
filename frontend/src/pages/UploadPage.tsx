import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { CloudUpload, CheckCircle, Error } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const UploadPage: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success?: string;
    error?: string;
  }>({});
  const navigate = useNavigate();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setUploadStatus({
          error: 'Please upload a valid image file (JPEG, PNG, or GIF)',
        });
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setUploadStatus({
          error: 'File size must be less than 10MB',
        });
        return;
      }

      setUploading(true);
      setUploadStatus({});

      try {
        const response = await apiService.uploadImage(file);
        setUploadStatus({
          success: `Image uploaded successfully! ID: ${response.id}`,
        });

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadStatus({
          error: 'Failed to upload image. Please try again.',
        });
      } finally {
        setUploading(false);
      }
    },
    [navigate]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      },
      multiple: false,
      disabled: uploading,
    });

  return (
    <Box>
      <Typography variant='h4' component='h1' gutterBottom>
        Upload Image
      </Typography>

      <Typography variant='body1' color='text.secondary' paragraph>
        Upload an image to process it with our AI-powered annotation system. The
        image will be automatically processed to detect edges and generate
        annotations.
      </Typography>

      {uploadStatus.success && (
        <Alert severity='success' sx={{ mb: 3 }}>
          {uploadStatus.success}
        </Alert>
      )}

      {uploadStatus.error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {uploadStatus.error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              backgroundColor: isDragActive
                ? 'action.hover'
                : 'background.paper',
              p: 4,
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <Box>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant='h6' gutterBottom>
                  Uploading...
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Please wait while we upload your image
                </Typography>
              </Box>
            ) : (
              <Box>
                <CloudUpload
                  sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}
                />
                <Typography variant='h5' gutterBottom>
                  {isDragActive
                    ? 'Drop the image here'
                    : 'Drag & drop an image here'}
                </Typography>
                <Typography variant='body1' color='text.secondary' gutterBottom>
                  or click to select a file
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Supports: JPEG, PNG, GIF (Max 10MB)
                </Typography>

                {isDragReject && (
                  <Alert severity='error' sx={{ mt: 2 }}>
                    Invalid file type. Please upload an image file.
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Upload Guidelines
              </Typography>
              <Box component='ul' sx={{ pl: 2 }}>
                <Typography component='li' variant='body2' gutterBottom>
                  Supported formats: JPEG, PNG, GIF
                </Typography>
                <Typography component='li' variant='body2' gutterBottom>
                  Maximum file size: 10MB
                </Typography>
                <Typography component='li' variant='body2' gutterBottom>
                  Images will be automatically processed
                </Typography>
                <Typography component='li' variant='body2' gutterBottom>
                  Processing includes edge detection and annotation
                </Typography>
                <Typography component='li' variant='body2' gutterBottom>
                  Results will be available in the dashboard
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3} display='flex' gap={2}>
        <Button
          variant='outlined'
          onClick={() => navigate('/')}
          disabled={uploading}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default UploadPage;
