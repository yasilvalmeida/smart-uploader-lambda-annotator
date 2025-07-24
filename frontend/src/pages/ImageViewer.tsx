import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  Visibility,
  VisibilityOff,
  Download,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, ImageData, Annotation } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`image-tabpanel-${index}`}
      aria-labelledby={`image-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ImageViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [image, setImage] = useState<ImageData | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showOverlays, setShowOverlays] = useState(true);

  const fetchImageData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [imageData, annotationsData] = await Promise.all([
        apiService.getImage(id),
        apiService.getAnnotations(id),
      ]);

      setImage(imageData);
      setAnnotations(annotationsData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch image data');
      console.error('Error fetching image data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImageData();
  }, [id]);

  useEffect(() => {
    if (image && canvasRef.current && showOverlays) {
      drawOverlays();
    }
  }, [image, annotations, showOverlays]);

  const drawOverlays = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw original image
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Draw annotations
      annotations.forEach((annotation) => {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';

        if (annotation.type === 'edge') {
          // Draw edge detection
          ctx.beginPath();
          annotation.coordinates.forEach((coord, index) => {
            if (index === 0) {
              ctx.moveTo(coord[0], coord[1]);
            } else {
              ctx.lineTo(coord[0], coord[1]);
            }
          });
          ctx.stroke();
        } else if (annotation.type === 'region') {
          // Draw region
          ctx.beginPath();
          annotation.coordinates.forEach((coord, index) => {
            if (index === 0) {
              ctx.moveTo(coord[0], coord[1]);
            } else {
              ctx.lineTo(coord[0], coord[1]);
            }
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (annotation.type === 'point') {
          // Draw point
          const [x, y] = annotation.coordinates[0];
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        }
      });
    };
    img.src = image.originalUrl;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  if (error || !image) {
    return <Alert severity='error'>{error || 'Image not found'}</Alert>;
  }

  return (
    <Box>
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>

        <Box display='flex' gap={2}>
          <Button startIcon={<Refresh />} onClick={fetchImageData}>
            Refresh
          </Button>
          <Button
            startIcon={showOverlays ? <VisibilityOff /> : <Visibility />}
            onClick={() => setShowOverlays(!showOverlays)}
          >
            {showOverlays ? 'Hide' : 'Show'} Overlays
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label='Original' />
                  <Tab label='With Overlays' />
                  {image.processedUrl && <Tab label='Processed' />}
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <Box textAlign='center'>
                  <img
                    src={image.originalUrl}
                    alt={image.filename}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box textAlign='center'>
                  <canvas
                    ref={canvasRef}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      border: '1px solid #ddd',
                    }}
                  />
                </Box>
              </TabPanel>

              {image.processedUrl && (
                <TabPanel value={tabValue} index={2}>
                  <Box textAlign='center'>
                    <img
                      src={image.processedUrl}
                      alt={`${image.filename} - Processed`}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </Box>
                </TabPanel>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Image Details
              </Typography>

              <Typography variant='body2' color='text.secondary' gutterBottom>
                <strong>Filename:</strong> {image.filename}
              </Typography>

              <Typography variant='body2' color='text.secondary' gutterBottom>
                <strong>Uploaded:</strong>{' '}
                {new Date(image.uploadedAt).toLocaleString()}
              </Typography>

              {image.processedAt && (
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  <strong>Processed:</strong>{' '}
                  {new Date(image.processedAt).toLocaleString()}
                </Typography>
              )}

              <Box mt={2}>
                <Chip
                  label={image.status}
                  color={getStatusColor(image.status) as any}
                  size='small'
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant='h6' gutterBottom>
                Annotations ({annotations.length})
              </Typography>

              {annotations.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                  No annotations available
                </Typography>
              ) : (
                <List dense>
                  {annotations.map((annotation, index) => (
                    <ListItem key={annotation.id || index}>
                      <ListItemText
                        primary={`${annotation.type} (${annotation.coordinates.length} points)`}
                        secondary={`Confidence: ${(
                          annotation.confidence * 100
                        ).toFixed(1)}%`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImageViewer;
