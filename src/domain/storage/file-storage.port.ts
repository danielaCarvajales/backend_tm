// Puerto de almacenamiento de archivos (S3-compatible).
export interface IFileStoragePort {

  upload(params: {
    body: Buffer;
    mimeType: string;
    originalFileName: string;
  }): Promise<{ publicPath: string }>;

  deleteByPublicPath(publicPath: string): Promise<void>;

  downloadByPublicPath(publicPath: string): Promise<{
    body: Buffer;
    contentType: string | undefined;
  }>;
}
