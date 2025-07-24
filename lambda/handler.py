import json
import boto3
import cv2
import numpy as np
from PIL import Image
import io
import os
import logging
from typing import Dict, Any, List

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
s3_client = boto3.client('s3')
lambda_client = boto3.client('lambda')

def process_image(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda function to process uploaded images.
    
    Args:
        event: S3 event containing bucket and key information
        context: Lambda context
    
    Returns:
        Dict containing processing results
    """
    try:
        logger.info(f"Processing event: {json.dumps(event)}")
        
        # Extract S3 information from event
        if 'Records' in event:
            # S3 trigger event
            s3_record = event['Records'][0]['s3']
            bucket = s3_record['bucket']['name']
            key = s3_record['object']['key']
        else:
            # Direct invocation event
            bucket = event.get('bucket', os.environ.get('S3_BUCKET'))
            key = event.get('s3Key')
            image_id = event.get('imageId')
        
        if not bucket or not key:
            raise ValueError("Missing bucket or key information")
        
        logger.info(f"Processing image from bucket: {bucket}, key: {key}")
        
        # Download image from S3
        image_data = download_image_from_s3(bucket, key)
        
        # Process the image
        processed_image, annotations = process_image_data(image_data)
        
        # Upload processed image back to S3
        processed_key = key.replace('uploads/', 'processed/')
        processed_url = upload_processed_image(processed_image, bucket, processed_key)
        
        # Create response
        response = {
            'statusCode': 200,
            'body': {
                'imageId': image_id,
                'originalKey': key,
                'processedKey': processed_key,
                'processedUrl': processed_url,
                'annotations': annotations,
                'message': 'Image processed successfully'
            }
        }
        
        logger.info(f"Processing completed successfully: {json.dumps(response)}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return {
            'statusCode': 500,
            'body': {
                'error': str(e),
                'message': 'Image processing failed'
            }
        }

def download_image_from_s3(bucket: str, key: str) -> bytes:
    """Download image from S3 bucket."""
    try:
        response = s3_client.get_object(Bucket=bucket, Key=key)
        return response['Body'].read()
    except Exception as e:
        logger.error(f"Error downloading image from S3: {str(e)}")
        raise

def process_image_data(image_data: bytes) -> tuple:
    """
    Process image data using OpenCV for edge detection and annotation.
    
    Args:
        image_data: Raw image bytes
    
    Returns:
        Tuple of (processed_image_bytes, annotations_list)
    """
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Could not decode image")
        
        # Convert to grayscale for processing
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Edge detection using Canny
        edges = cv2.Canny(blurred, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Create annotations from contours
        annotations = []
        for i, contour in enumerate(contours):
            if cv2.contourArea(contour) > 100:  # Filter small contours
                # Convert contour to list of coordinates
                coords = contour.reshape(-1, 2).tolist()
                
                annotation = {
                    'id': f'contour_{i}',
                    'type': 'edge',
                    'coordinates': coords,
                    'confidence': 0.85 + (i * 0.01),  # Mock confidence
                    'label': f'Edge {i+1}'
                }
                annotations.append(annotation)
        
        # Create processed image (original with edges overlaid)
        processed_image = image.copy()
        cv2.drawContours(processed_image, contours, -1, (0, 255, 0), 2)
        
        # Convert back to bytes
        _, buffer = cv2.imencode('.jpg', processed_image)
        processed_bytes = buffer.tobytes()
        
        return processed_bytes, annotations
        
    except Exception as e:
        logger.error(f"Error processing image data: {str(e)}")
        raise

def upload_processed_image(image_data: bytes, bucket: str, key: str) -> str:
    """Upload processed image to S3 and return public URL."""
    try:
        s3_client.put_object(
            Bucket=bucket,
            Key=key,
            Body=image_data,
            ContentType='image/jpeg',
            ACL='public-read'
        )
        
        # Generate public URL
        region = os.environ.get('AWS_REGION', 'us-east-1')
        url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
        
        logger.info(f"Uploaded processed image to: {url}")
        return url
        
    except Exception as e:
        logger.error(f"Error uploading processed image: {str(e)}")
        raise

def create_grayscale_image(image_data: bytes) -> bytes:
    """Create a grayscale version of the image."""
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to grayscale
        gray_image = image.convert('L')
        
        # Convert back to bytes
        buffer = io.BytesIO()
        gray_image.save(buffer, format='JPEG')
        return buffer.getvalue()
        
    except Exception as e:
        logger.error(f"Error creating grayscale image: {str(e)}")
        raise 