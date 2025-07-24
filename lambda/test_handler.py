import pytest
import json
import boto3
from unittest.mock import Mock, patch, MagicMock
from handler import process_image, process_image_data, download_image_from_s3

class TestLambdaHandler:
    
    def test_process_image_s3_event(self):
        """Test processing image with S3 event."""
        event = {
            'Records': [{
                's3': {
                    'bucket': {'name': 'test-bucket'},
                    'object': {'key': 'uploads/test-image.jpg'}
                }
            }]
        }
        
        with patch('handler.download_image_from_s3') as mock_download, \
             patch('handler.process_image_data') as mock_process, \
             patch('handler.upload_processed_image') as mock_upload:
            
            mock_download.return_value = b'test-image-data'
            mock_process.return_value = (b'processed-data', [{'id': '1', 'type': 'edge'}])
            mock_upload.return_value = 'https://test-bucket.s3.amazonaws.com/processed/test-image.jpg'
            
            result = process_image(event, {})
            
            assert result['statusCode'] == 200
            assert 'processedUrl' in result['body']
            assert 'annotations' in result['body']
    
    def test_process_image_direct_invocation(self):
        """Test processing image with direct invocation event."""
        event = {
            'bucket': 'test-bucket',
            's3Key': 'uploads/test-image.jpg',
            'imageId': 'test-id'
        }
        
        with patch('handler.download_image_from_s3') as mock_download, \
             patch('handler.process_image_data') as mock_process, \
             patch('handler.upload_processed_image') as mock_upload:
            
            mock_download.return_value = b'test-image-data'
            mock_process.return_value = (b'processed-data', [{'id': '1', 'type': 'edge'}])
            mock_upload.return_value = 'https://test-bucket.s3.amazonaws.com/processed/test-image.jpg'
            
            result = process_image(event, {})
            
            assert result['statusCode'] == 200
            assert result['body']['imageId'] == 'test-id'
    
    def test_process_image_missing_bucket_key(self):
        """Test processing image with missing bucket or key."""
        event = {}
        
        result = process_image(event, {})
        
        assert result['statusCode'] == 500
        assert 'error' in result['body']
    
    def test_process_image_data_success(self):
        """Test successful image data processing."""
        # Create a simple test image (1x1 pixel)
        test_image_data = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9'
        
        with patch('cv2.imdecode') as mock_imdecode, \
             patch('cv2.cvtColor') as mock_cvtcolor, \
             patch('cv2.GaussianBlur') as mock_blur, \
             patch('cv2.Canny') as mock_canny, \
             patch('cv2.findContours') as mock_contours, \
             patch('cv2.imencode') as mock_imencode:
            
            # Mock OpenCV functions
            mock_imdecode.return_value = Mock(shape=(100, 100, 3))
            mock_cvtcolor.return_value = Mock(shape=(100, 100))
            mock_blur.return_value = Mock(shape=(100, 100))
            mock_canny.return_value = Mock(shape=(100, 100))
            mock_contours.return_value = ([Mock()], None)
            mock_imencode.return_value = (True, b'processed-image-data')
            
            processed_image, annotations = process_image_data(test_image_data)
            
            assert isinstance(processed_image, bytes)
            assert isinstance(annotations, list)
    
    def test_download_image_from_s3_success(self):
        """Test successful S3 image download."""
        with patch('boto3.client') as mock_boto3:
            mock_s3 = Mock()
            mock_s3.get_object.return_value = {'Body': Mock(read=lambda: b'test-data')}
            mock_boto3.return_value = mock_s3
            
            result = download_image_from_s3('test-bucket', 'test-key')
            
            assert result == b'test-data'
            mock_s3.get_object.assert_called_once_with(Bucket='test-bucket', Key='test-key')
    
    def test_download_image_from_s3_error(self):
        """Test S3 image download error."""
        with patch('boto3.client') as mock_boto3:
            mock_s3 = Mock()
            mock_s3.get_object.side_effect = Exception('S3 error')
            mock_boto3.return_value = mock_s3
            
            with pytest.raises(Exception):
                download_image_from_s3('test-bucket', 'test-key')

if __name__ == '__main__':
    pytest.main([__file__]) 