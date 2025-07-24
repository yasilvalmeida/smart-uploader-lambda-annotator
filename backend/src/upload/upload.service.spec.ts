import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { S3Service } from '../shared/s3.service';
import { LambdaService } from '../shared/lambda.service';

describe('UploadService', () => {
  let service: UploadService;
  let s3Service: S3Service;
  let lambdaService: LambdaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
        {
          provide: LambdaService,
          useValue: {
            triggerProcessing: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    s3Service = module.get<S3Service>(S3Service);
    lambdaService = module.get<LambdaService>(LambdaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const mockS3Url = 'https://test-bucket.s3.amazonaws.com/uploads/test.jpg';

      jest.spyOn(s3Service, 'uploadFile').mockResolvedValue(mockS3Url);
      jest.spyOn(lambdaService, 'triggerProcessing').mockResolvedValue();

      const result = await service.uploadImage(mockFile);

      expect(result.status).toBe('success');
      expect(result.filename).toBe('test.jpg');
      expect(result.originalUrl).toBe(mockS3Url);
      expect(s3Service.uploadFile).toHaveBeenCalled();
      expect(lambdaService.triggerProcessing).toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      jest.spyOn(s3Service, 'uploadFile').mockRejectedValue(new Error('S3 error'));

      await expect(service.uploadImage(mockFile)).rejects.toThrow('Upload failed: S3 error');
    });
  });

  describe('getUploadStatus', () => {
    it('should return upload status for existing ID', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      jest.spyOn(s3Service, 'uploadFile').mockResolvedValue('https://test.com/test.jpg');
      jest.spyOn(lambdaService, 'triggerProcessing').mockResolvedValue();

      const uploadResult = await service.uploadImage(mockFile);
      const status = await service.getUploadStatus(uploadResult.id);

      expect(status).toBeDefined();
      expect(status?.filename).toBe('test.jpg');
    });

    it('should return null for non-existing ID', async () => {
      const status = await service.getUploadStatus('non-existing-id');
      expect(status).toBeNull();
    });
  });

  describe('getAnnotations', () => {
    it('should return annotations for existing upload', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      jest.spyOn(s3Service, 'uploadFile').mockResolvedValue('https://test.com/test.jpg');
      jest.spyOn(lambdaService, 'triggerProcessing').mockResolvedValue();

      const uploadResult = await service.uploadImage(mockFile);
      const annotations = await service.getAnnotations(uploadResult.id);

      expect(annotations).toBeDefined();
      expect(Array.isArray(annotations)).toBe(true);
    });

    it('should return empty array for non-existing upload', async () => {
      const annotations = await service.getAnnotations('non-existing-id');
      expect(annotations).toEqual([]);
    });
  });
}); 