import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { IFileStoragePort } from '../../domain/storage/file-storage.port';


@Injectable()
export class SpacesFileStorageService implements IFileStoragePort {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('DO_SPACES_ENDPOINT');
    const region = this.config.get<string>('DO_SPACES_REGION') ?? 'us-east-1';
    const accessKeyId = this.config.get<string>('DO_SPACES_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('DO_SPACES_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('DO_SPACES_BUCKET') ?? '';

    this.client = new S3Client({
      region,
      endpoint,
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
      forcePathStyle: false,
    });
  }

  async upload(params: {body: Buffer; mimeType: string; originalFileName: string;}): Promise<{ publicPath: string }> {
    const ext = this.resolveExtension(
      params.originalFileName,
      params.mimeType,
    );
    const key = `documents/${randomUUID()}${ext}`;
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: params.body,
          ContentType: params.mimeType,
          ACL: 'public-read',
        }),
      );
    } catch {
      throw new Error('STORAGE_UPLOAD_FAILED');
    }
    return { publicPath: this.resolveStoredPublicUrl(key) };
  }

  async deleteByPublicPath(publicPath: string): Promise<void> {
    const key = this.toObjectKey(publicPath);
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch {
      throw new Error('STORAGE_DELETE_FAILED');
    }
  }

  async downloadByPublicPath(
    publicPath: string,
  ): Promise<{ body: Buffer; contentType: string | undefined }> {
    const key = this.toObjectKey(publicPath);
    try {
      const out = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      if (!out.Body) {
        throw new Error('STORAGE_DOWNLOAD_FAILED');
      }
      const bytes = await out.Body.transformToByteArray();
      return {
        body: Buffer.from(bytes),
        contentType: out.ContentType,
      };
    } catch {
      throw new Error('STORAGE_DOWNLOAD_FAILED');
    }
  }

  // URL pública para guardar en BD: base CDN/S3 + key, o `/{key}` si no hay base.
  private resolveStoredPublicUrl(key: string): string {
    const base = this.config
      .get<string>('DO_SPACES_PUBLIC_BASE_URL')
      ?.replace(/\/$/, '');
    return base ? `${base}/${key}` : `/${key}`;
  }

  // Acepta filas antiguas (`/documents/...`) y URLs absolutas nuevas. 
  private toObjectKey(stored: string): string {
    const s = stored.trim();
    if (/^https?:\/\//i.test(s)) {
      try {
        return new URL(s).pathname.replace(/^\//, '');
      } catch {
        return s.replace(/^\//, '');
      }
    }
    return s.replace(/^\//, '');
  }

  private resolveExtension(originalFileName: string, mimeType: string): string {
    const fromName = path.extname(originalFileName);
    if (fromName && fromName.length <= 10) {
      return fromName.toLowerCase();
    }
    return this.extensionFromMime(mimeType);
  }

  private extensionFromMime(mime: string): string {
    const map: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        '.docx',
    };
    return map[mime] ?? '.bin';
  }
}
