import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StockDocument {
  documentId: number;
  stockItemId: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  description?: string;
  uploadedAt: string;
  downloadUrl: string;
}

@Injectable({ providedIn: 'root' })
export class StockDocumentService {
  private apiUrl = `${environment.apiUrl}/api/stock-documents`;

  constructor(private http: HttpClient) {}

  getDocuments(stockItemId: number): Observable<StockDocument[]> {
    return this.http.get<StockDocument[]>(`${this.apiUrl}/stock/${stockItemId}`);
  }

  uploadDocument(stockItemId: number, file: File, description?: string): Observable<StockDocument> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    return this.http.post<StockDocument>(`${this.apiUrl}/stock/${stockItemId}/upload`, formData);
  }

  deleteDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${documentId}`);
  }

  getDownloadUrl(documentId: number): string {
    return `${environment.apiUrl}/api/stock-documents/${documentId}/download`;
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileIcon(fileType: string): string {
    if (!fileType) return 'bi-file-earmark';
    if (fileType.includes('pdf')) return 'bi-file-earmark-pdf';
    if (fileType.includes('image')) return 'bi-file-earmark-image';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'bi-file-earmark-excel';
    if (fileType.includes('word') || fileType.includes('document')) return 'bi-file-earmark-word';
    if (fileType.includes('zip') || fileType.includes('rar')) return 'bi-file-earmark-zip';
    return 'bi-file-earmark';
  }
}
