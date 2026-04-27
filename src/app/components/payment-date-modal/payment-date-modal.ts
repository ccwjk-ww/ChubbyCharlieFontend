import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-payment-date-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="payment-modal">
      <div class="modal-header">
        <h2>💰 ยืนยันการชำระเงิน</h2>
        <button class="close-btn" (click)="onCancel()">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="order-info">
          <p class="info-item">
            <span class="label">เลขที่ออเดอร์:</span>
            <span class="value">{{ data.orderNumber }}</span>
          </p>
          <p class="info-item">
            <span class="label">ยอดเงิน:</span>
            <span class="value amount">{{ formatCurrency(data.netAmount) }}</span>
          </p>
        </div>

        <div class="date-section">
          <label for="paymentDate">📅 เลือกวันที่ชำระเงิน</label>
          <input
            type="datetime-local"
            id="paymentDate"
            class="date-input"
            [(ngModel)]="selectedDateStr"
            [max]="maxDate"
          />
          <p class="hint">
            ⚠️ สามารถเลือกวันที่ในอดีตหรือปัจจุบันเท่านั้น
          </p>
        </div>

        <div class="preview-section" *ngIf="selectedDateStr">
          <div class="preview-card">
            <i class="bi bi-calendar-check"></i>
            <div class="preview-content">
              <p class="preview-label">วันที่ที่เลือก</p>
              <p class="preview-value">{{ formatPreviewDate() }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-cancel" (click)="onCancel()">
          ยกเลิก
        </button>
        <button
          class="btn btn-confirm"
          (click)="onConfirm()"
          [disabled]="!selectedDateStr">
          <i class="bi bi-check-circle"></i>
          ยืนยันการชำระเงิน
        </button>
      </div>
    </div>
  `,
  styles: [`
    .payment-modal {
      font-family: 'Inter', sans-serif;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 2px solid #e5e7eb;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(90deg);
    }

    .modal-body {
      padding: 24px;
    }

    .order-info {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 24px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 0.95rem;
    }

    .label {
      color: #6b7280;
      font-weight: 500;
    }

    .value {
      color: #1f2937;
      font-weight: 600;
    }

    .value.amount {
      color: #10b981;
      font-size: 1.2rem;
    }

    .date-section {
      margin: 24px 0;
    }

    .date-section label {
      display: block;
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 12px;
    }

    .date-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s;
      font-family: 'Inter', sans-serif;
    }

    .date-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .hint {
      margin-top: 8px;
      font-size: 0.85rem;
      color: #f59e0b;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .preview-section {
      margin-top: 24px;
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .preview-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .preview-card i {
      font-size: 2.5rem;
      opacity: 0.9;
    }

    .preview-content {
      flex: 1;
    }

    .preview-label {
      font-size: 0.85rem;
      opacity: 0.9;
      margin: 0 0 4px 0;
    }

    .preview-value {
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
      padding: 24px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .btn {
      flex: 1;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-cancel {
      background: white;
      color: #6b7280;
      border: 2px solid #e5e7eb;
    }

    .btn-cancel:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .btn-confirm {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-confirm:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    }

    .btn-confirm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .btn i {
      font-size: 1.1rem;
    }
  `]
})
export class PaymentDateModalComponent implements OnInit {
  selectedDateStr: string = '';
  maxDate: string = '';

  constructor(
    public dialogRef: MatDialogRef<PaymentDateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    // Set max date to now
    const now = new Date();
    this.maxDate = this.toDateTimeLocal(now);

    // ถ้ามีวันที่เดิมอยู่แล้ว ให้ใช้วันที่นั้น
    if (this.data.currentPaymentDate) {
      this.selectedDateStr = this.toDateTimeLocal(new Date(this.data.currentPaymentDate));
    } else {
      // ถ้าไม่มี ให้ใช้วันที่ปัจจุบัน
      this.selectedDateStr = this.maxDate;
    }
  }

  toDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  formatPreviewDate(): string {
    if (!this.selectedDateStr) return '';

    const date = new Date(this.selectedDateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | undefined | null): string {
    const value = amount ?? 0;
    return `฿${value.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  onConfirm(): void {
    if (!this.selectedDateStr) {
      alert('กรุณาเลือกวันที่ชำระเงิน');
      return;
    }

    const paymentDate = new Date(this.selectedDateStr);
    this.dialogRef.close({
      confirmed: true,
      paymentDate: paymentDate
    });
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }
}
