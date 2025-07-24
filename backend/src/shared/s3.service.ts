import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET', 'smart-uploader-dev');
    
    this.s3 = new AWS.S3({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      endpoint: this.configService.get<string>('AWS_ENDPOINT'), // For localstack
      s3ForcePathStyle: true, // For localstack
    });
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<string> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    };

    try {
      await this.s3.putObject(params).promise();
      
      // Return the public URL
      if (this.configService.get<string>('AWS_ENDPOINT')) {
        // Localstack URL
        return `${this.configService.get<string>('AWS_ENDPOINT')}/${this.bucketName}/${key}`;
      } else {
        // AWS S3 URL
        return `https://${this.bucketName}.s3.${this.configService.get<string>('AWS_REGION', 'us-east-1')}.amazonaws.com/${key}`;
      }
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async getFile(key: string): Promise<Buffer> {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      const result = await this.s3.getObject(params).promise();
      return result.Body as Buffer;
    } catch (error) {
      throw new Error(`Failed to get file from S3: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      return this.s3.getSignedUrl('getObject', {
        ...params,
        Expires: expiresIn,
      });
    } catch (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }
} 