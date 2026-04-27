import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockDocumentService, StockDocument } from '../../services/stock-document.service';

@Component({
  selector: 'app-stock-document-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="doc-widget" [ngClass]="theme">
  <!-- Header -->
  <div class="doc-widget-header" (click)="toggleExpand()">
    <span class="doc-widget-title">
      <i class="bi bi-paperclip"></i>
      เอกสารแนบ
      <span class="doc-count-badge" *ngIf="documents.length > 0">{{documents.length}}</span>
    </span>
    <i class="bi" [ngClass]="expanded ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
  </div>

  <!-- Body -->
  <div class="doc-widget-body" *ngIf="expanded">

    <!-- Upload Zone -->
    <div class="upload-zone"
         [class.dragover]="isDragOver"
         (dragover)="onDragOver($event)"
         (dragleave)="isDragOver = false"
         (drop)="onDrop($event)"
         (click)="fileInput.click()">
      <input #fileInput type="file" hidden multiple (change)="onFileSelected($event)"
             accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip">
      <i class="bi bi-cloud-upload upload-icon"></i>
      <p class="upload-text">คลิกหรือลากไฟล์มาวางที่นี่</p>
      <small class="upload-hint">PDF, Word, Excel, รูปภาพ (สูงสุด 20MB)</small>
    </div>

    <!-- Pending files (รอ upload) -->
    <div class="pending-files" *ngIf="pendingFiles.length > 0">
      <div class="pending-file-item" *ngFor="let pf of pendingFiles; let i = index">
        <i class="bi" [ngClass]="getFileIcon(pf.file.type)"></i>
        <div class="pending-file-info">
          <span class="pf-name">{{pf.file.name}}</span>
          <span class="pf-size">{{formatFileSize(pf.file.size)}}</span>
          <input class="pf-desc" [(ngModel)]="pf.description"
                 placeholder="คำอธิบาย (ไม่บังคับ)" type="text">
        </div>
        <button class="pf-remove" (click)="removePending(i)" title="ลบ">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <button class="btn-upload-all" (click)="uploadAll()" [disabled]="uploading">
        <i class="bi" [ngClass]="uploading ? 'bi-hourglass-split' : 'bi-upload'"></i>
        {{uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด (' + pendingFiles.length + ' ไฟล์)'}}
      </button>
    </div>

    <!-- Loading -->
    <div class="doc-loading" *ngIf="loading">
      <div class="doc-spinner"></div><span>กำลังโหลด...</span>
    </div>

    <!-- Document List -->
    <div class="doc-list" *ngIf="!loading">
      <div class="doc-empty" *ngIf="documents.length === 0 && pendingFiles.length === 0">
        <i class="bi bi-folder2-open"></i>
        <span>ยังไม่มีเอกสาร</span>
      </div>
      <div class="doc-item" *ngFor="let doc of documents">
        <div class="doc-item-icon">
          <i class="bi" [ngClass]="getFileIcon(doc.fileType)"></i>
        </div>
        <div class="doc-item-info">
          <span class="doc-name" [title]="doc.originalName">{{doc.originalName}}</span>
          <span class="doc-meta">
            {{formatFileSize(doc.fileSize)}} · {{formatDate(doc.uploadedAt)}}
          </span>
          <span class="doc-desc" *ngIf="doc.description">{{doc.description}}</span>
        </div>
        <div class="doc-item-actions">
          <a [href]="getDownloadUrl(doc.documentId)" target="_blank"
             class="doc-btn doc-btn-download" title="ดาวน์โหลด">
            <i class="bi bi-download"></i>
          </a>
          <button class="doc-btn doc-btn-delete" (click)="confirmDelete(doc)" title="ลบ">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
.doc-widget {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 16px;
  font-family: inherit;
}

.doc-widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #f9fafb;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #e5e7eb;
}

.doc-widget-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.doc-count-badge {
  background: #d97706;
  color: white;
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 700;
}

/* Thailand green theme */
.doc-widget.theme-green .doc-count-badge { background: #16a34a; }
.doc-widget.theme-green .btn-upload-all { background: #16a34a; }
.doc-widget.theme-green .btn-upload-all:hover:not(:disabled) { background: #15803d; }

.doc-widget-body { padding: 14px 16px; }

/* Upload Zone */
.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
  margin-bottom: 12px;
}
.upload-zone:hover, .upload-zone.dragover {
  border-color: #d97706;
  background: #fffbf0;
}
.doc-widget.theme-green .upload-zone:hover,
.doc-widget.theme-green .upload-zone.dragover {
  border-color: #16a34a;
  background: #f0fdf4;
}
.upload-icon { font-size: 24px; color: #9ca3af; display: block; margin-bottom: 6px; }
.upload-text { margin: 0; font-size: 13px; color: #6b7280; font-weight: 500; }
.upload-hint { color: #9ca3af; font-size: 11px; }

/* Pending Files */
.pending-files { margin-bottom: 12px; }
.pending-file-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: #fffbf0;
  border: 1px solid #fde68a;
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 12px;
}
.pending-file-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.pf-name { font-weight: 600; color: #374151; }
.pf-size { color: #9ca3af; }
.pf-desc {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 3px 7px;
  font-size: 11px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.pf-remove {
  background: none; border: none; cursor: pointer; color: #ef4444; padding: 2px 4px;
}
.btn-upload-all {
  width: 100%;
  padding: 8px;
  background: #d97706;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 6px;
  transition: background 0.15s;
}
.btn-upload-all:hover:not(:disabled) { background: #b45309; }
.btn-upload-all:disabled { opacity: 0.5; cursor: not-allowed; }

/* Doc List */
.doc-loading { display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px; padding: 8px 0; }
.doc-spinner {
  width: 16px; height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #d97706;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.doc-empty { display: flex; flex-direction: column; align-items: center; padding: 20px; color: #9ca3af; font-size: 13px; gap: 6px; }
.doc-empty i { font-size: 24px; }

.doc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid #f3f4f6;
  border-radius: 6px;
  margin-bottom: 6px;
  background: white;
  transition: background 0.15s;
}
.doc-item:hover { background: #f9fafb; }
.doc-item-icon { font-size: 20px; color: #6b7280; min-width: 24px; text-align: center; }
.doc-item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
.doc-name { font-size: 13px; font-weight: 600; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-meta { font-size: 11px; color: #9ca3af; }
.doc-desc { font-size: 11px; color: #6b7280; font-style: italic; }
.doc-item-actions { display: flex; gap: 4px; flex-shrink: 0; }
.doc-btn {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  text-decoration: none;
  color: #374151;
  transition: all 0.15s;
}
.doc-btn-download:hover { background: #dbeafe; border-color: #93c5fd; color: #1d4ed8; }
.doc-btn-delete:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
  `]
})
export class StockDocumentWidgetComponent implements OnInit {
  @Input() stockItemId!: number;
  @Input() theme: 'theme-orange' | 'theme-green' = 'theme-orange';

  documents: StockDocument[] = [];
  loading = false;
  uploading = false;
  expanded = true;
  isDragOver = false;
  pendingFiles: { file: File; description: string }[] = [];

  constructor(private docService: StockDocumentService) {}

  ngOnInit(): void {
    if (this.stockItemId) this.loadDocuments();
  }

  toggleExpand(): void { this.expanded = !this.expanded; }

  loadDocuments(): void {
    this.loading = true;
    this.docService.getDocuments(this.stockItemId).subscribe({
      next: (docs) => { this.documents = docs; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addPendingFiles(Array.from(input.files));
    input.value = '';
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); this.isDragOver = true; }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files) this.addPendingFiles(Array.from(event.dataTransfer.files));
  }

  addPendingFiles(files: File[]): void {
    files.forEach(f => {
      if (f.size > 20 * 1024 * 1024) { alert(`❌ ${f.name} ขนาดเกิน 20MB`); return; }
      this.pendingFiles.push({ file: f, description: '' });
    });
  }

  removePending(index: number): void { this.pendingFiles.splice(index, 1); }

  uploadAll(): void {
    if (!this.stockItemId || this.pendingFiles.length === 0) return;
    this.uploading = true;
    let remaining = this.pendingFiles.length;
    const toUpload = [...this.pendingFiles];
    this.pendingFiles = [];

    toUpload.forEach(pf => {
      this.docService.uploadDocument(this.stockItemId, pf.file, pf.description).subscribe({
        next: (doc) => {
          this.documents.unshift(doc);
          remaining--;
          if (remaining === 0) this.uploading = false;
        },
        error: (e) => {
          alert(`❌ อัปโหลด ${pf.file.name} ล้มเหลว`);
          remaining--;
          if (remaining === 0) this.uploading = false;
        }
      });
    });
  }

  confirmDelete(doc: StockDocument): void {
    if (!confirm(`ลบไฟล์ "${doc.originalName}" ?`)) return;
    this.docService.deleteDocument(doc.documentId).subscribe({
      next: () => { this.documents = this.documents.filter(d => d.documentId !== doc.documentId); },
      error: () => alert('❌ ลบไฟล์ไม่สำเร็จ')
    });
  }

  getDownloadUrl(documentId: number): string { return this.docService.getDownloadUrl(documentId); }
  getFileIcon(fileType: string): string { return this.docService.getFileIcon(fileType); }
  formatFileSize(bytes: number): string { return this.docService.formatFileSize(bytes); }

  formatDate(isoStr: string): string {
    if (!isoStr) return '-';
    return new Date(isoStr).toLocaleDateString('th-TH', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
