import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LambdaService {
  private lambda: AWS.Lambda;
  private functionName: string;

  constructor(private configService: ConfigService) {
    this.functionName = this.configService.get<string>('AWS_LAMBDA_FUNCTION', 'image-processor');
    
    this.lambda = new AWS.Lambda({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      endpoint: this.configService.get<string>('AWS_LAMBDA_ENDPOINT'), // For localstack
    });
  }

  async triggerProcessing(imageId: string, s3Key: string): Promise<void> {
    const payload = {
      imageId,
      s3Key,
      bucket: this.configService.get<string>('AWS_S3_BUCKET', 'smart-uploader-dev'),
      timestamp: new Date().toISOString(),
    };

    const params: AWS.Lambda.InvokeRequest = {
      FunctionName: this.functionName,
      InvocationType: 'Event', // Asynchronous invocation
      Payload: JSON.stringify(payload),
    };

    try {
      await this.lambda.invoke(params).promise();
    } catch (error) {
      throw new Error(`Failed to trigger Lambda processing: ${error.message}`);
    }
  }

  async invokeFunction(
    functionName: string,
    payload: any,
    invocationType: 'RequestResponse' | 'Event' = 'RequestResponse',
  ): Promise<any> {
    const params: AWS.Lambda.InvokeRequest = {
      FunctionName: functionName,
      InvocationType: invocationType,
      Payload: JSON.stringify(payload),
    };

    try {
      const result = await this.lambda.invoke(params).promise();
      
      if (invocationType === 'RequestResponse' && result.Payload) {
        return JSON.parse(result.Payload.toString());
      }
      
      return result;
    } catch (error) {
      throw new Error(`Failed to invoke Lambda function: ${error.message}`);
    }
  }

  async getFunctionStatus(functionName: string): Promise<any> {
    const params: AWS.Lambda.GetFunctionRequest = {
      FunctionName: functionName,
    };

    try {
      return await this.lambda.getFunction(params).promise();
    } catch (error) {
      throw new Error(`Failed to get function status: ${error.message}`);
    }
  }
} 