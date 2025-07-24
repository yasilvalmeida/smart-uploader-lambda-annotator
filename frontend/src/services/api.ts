import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ImageData {
  id: string;
  filename: string;
  originalUrl: string;
  processedUrl?: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  uploadedAt: string;
  processedAt?: string;
  annotations?: Annotation[];
}

export interface Annotation {
  id: string;
  type: 'edge' | 'region' | 'point';
  coordinates: number[][];
  confidence: number;
  label?: string;
}

export interface UploadResponse {
  id: string;
  status: string;
  message: string;
}

export const apiService = {
  // Upload image
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get all images
  getImages: async (): Promise<ImageData[]> => {
    const response = await api.get('/api/images');
    return response.data;
  },

  // Get single image
  getImage: async (id: string): Promise<ImageData> => {
    const response = await api.get(`/api/images/${id}`);
    return response.data;
  },

  // Get image annotations
  getAnnotations: async (id: string): Promise<Annotation[]> => {
    const response = await api.get(`/api/upload/${id}/annotations`);
    return response.data;
  },

  // Delete image
  deleteImage: async (id: string): Promise<void> => {
    await api.delete(`/api/images/${id}`);
  },

  // Trigger processing
  triggerProcessing: async (id: string): Promise<void> => {
    await api.post(`/api/process/${id}`);
  },

  // Get processing status
  getProcessingStatus: async (id: string): Promise<{ status: string }> => {
    const response = await api.get(`/api/process/${id}/status`);
    return response.data;
  },
};

export default api;
