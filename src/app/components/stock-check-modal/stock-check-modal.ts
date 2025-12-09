import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StockCheckDetail, IngredientDetail } from '../../services/order.service';

export interface StockCheckModalData {
  orderNumber: string;
  allAvailable: boolean;
  details: StockCheckDetail[];
}

@Component({
  selector: 'app-stock-check-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="stock-check-modal">
      <div class="modal-header" [class.success]="data.allAvailable" [class.warning]="!data.allAvailable">
        <mat-icon>{{ data.allAvailable ? 'check_circle' : 'warning' }}</mat-icon>
        <h2>เช็ค Stock: {{ data.orderNumber }}</h2>
        <button mat-icon-button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="modal-body">
        <div class="status-banner" [class.success]="data.allAvailable" [class.warning]="!data.allAvailable">
          <mat-icon>{{ data.allAvailable ? 'check_circle' : 'warning' }}</mat-icon>
          <span>{{ data.allAvailable ? '✅ Stock เพียงพอทั้งหมด พร้อมตัด Stock' : '⚠️ Stock ไม่เพียงพอบางรายการ' }}</span>
        </div>

        <div class="details-container">
          <div class="product-card" *ngFor="let detail of data.details; let i = index">
            <div class="product-header">
              <div class="product-info">
                <span class="product-number">#{{ i + 1 }}</span>
                <h3>{{ detail.productName }}</h3>
              </div>
              <div class="product-status">
                <span class="badge" [class.success]="detail.available" [class.danger]="!detail.available">
                  <mat-icon>{{ detail.available ? 'check' : 'close' }}</mat-icon>
                  {{ detail.available ? 'เพียงพอ' : 'ไม่เพียงพอ' }}
                </span>
                <span class="quantity-badge">จำนวน: {{ detail.orderQuantity }}</span>
              </div>
            </div>

            <div class="ingredients-table-container">
              <table class="ingredients-table">
                <thead>
                <tr>
                  <th>Ingredient</th>
                  <th class="text-center">ประเภท</th>
                  <th class="text-center">Stock Lot</th>
                  <th class="text-center">ต้องการ</th>
                  <th class="text-center">มีอยู่</th>
                  <th class="text-center">สถานะ</th>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let ing of detail.ingredients" [class.danger-row]="!ing.available">
                  <td>
                    <div class="ingredient-name">{{ ing.ingredientName }}</div>
                    <div class="stock-name" *ngIf="ing.stockItemName">{{ ing.stockItemName }}</div>
                  </td>

                  <!-- ⭐ ประเภท Stock (CHINA/THAI) -->
                  <td class="text-center">
                      <span class="type-badge" [class.china]="ing.stockType === 'CHINA'" [class.thai]="ing.stockType === 'THAI'">
                        {{ ing.stockType || '-' }}
                      </span>
                  </td>

                  <!-- ⭐ Stock Lot Information -->
                  <td class="text-center">
                    <div class="lot-info" *ngIf="ing.stockLotName">
                      <div class="lot-name">{{ ing.stockLotName }}</div>
                      <div class="lot-status" [class.active]="ing.stockLotStatus === 'ACTIVE'"
                           [class.completed]="ing.stockLotStatus === 'COMPLETED'">
                        {{ ing.stockLotStatus }}
                      </div>
                    </div>
                    <span *ngIf="!ing.stockLotName" class="text-muted">-</span>
                  </td>

                  <td class="text-center">
                    <span class="quantity-cell">{{ ing.requiredQuantity }} {{ ing.unit }}</span>
                  </td>
                  <td class="text-center">
                      <span class="quantity-cell" [class.success-text]="ing.available" [class.danger-text]="!ing.available">
                        {{ ing.currentStock !== null && ing.currentStock !== undefined ? ing.currentStock : '-' }} {{ ing.unit }}
                      </span>
                  </td>
                  <td class="text-center">
                      <span class="status-badge" [class.success]="ing.available" [class.danger]="!ing.available">
                        <mat-icon>{{ ing.available ? 'check' : 'priority_high' }}</mat-icon>
                        <span *ngIf="ing.available">เพียงพอ</span>
                        <span *ngIf="!ing.available && ing.shortage">ขาด {{ ing.shortage }} {{ ing.unit }}</span>
                        <span *ngIf="!ing.available && !ing.shortage">{{ ing.errorMessage || 'ไม่เพียงพอ' }}</span>
                      </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button mat-button class="btn-secondary" (click)="close()">
          <mat-icon>close</mat-icon>
          ปิด
        </button>
        <button
          mat-raised-button
          color="primary"
          class="btn-primary"
          [disabled]="!data.allAvailable"
          (click)="confirmDeductStock()">
          <mat-icon>done</mat-icon>
          ยืนยันตัด Stock
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* ⭐ ปรับให้ Modal ใหญ่ขึ้นเกือบเต็มหน้าจอ */
    .stock-check-modal {
      width: 95vw;
      max-width: 1400px;
      height: 90vh;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px;
      border-bottom: 2px solid #e0e0e0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      flex-shrink: 0;

      &.success {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      }

      &.warning {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      h2 {
        flex: 1;
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .close-btn {
        color: white;
      }
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
      min-height: 0;
    }

    .status-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 16px;
      font-weight: 500;

      &.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      &.warning {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeeba;
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .details-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .product-card {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
    }

    .product-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .product-number {
        background: #6c757d;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
      }

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
    }

    .product-status {
      display: flex;
      align-items: center;
      gap: 8px;

      .quantity-badge {
        background: #e9ecef;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .ingredients-table-container {
      overflow-x: auto;
    }

    .ingredients-table {
      width: 100%;
      border-collapse: collapse;

      thead {
        background: #f8f9fa;

        th {
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
          white-space: nowrap;
          position: sticky;
          top: 0;
          background: #f8f9fa;
          z-index: 10;
        }
      }

      tbody {
        tr {
          border-bottom: 1px solid #e9ecef;
          transition: background 0.2s;

          &:hover {
            background: #f8f9fa;
          }

          &.danger-row {
            background: #fff5f5;

            &:hover {
              background: #ffe5e5;
            }
          }

          td {
            padding: 14px 16px;
            font-size: 14px;
          }
        }
      }
    }

    .ingredient-name {
      font-weight: 600;
      color: #212529;
      margin-bottom: 4px;
      font-size: 14px;
    }

    .stock-name {
      font-size: 12px;
      color: #6c757d;
    }

    /* ⭐ Stock Type Badge */
    .type-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &.china {
        background: #e3f2fd;
        color: #1565c0;
        border: 1px solid #90caf9;
      }

      &.thai {
        background: #f3e5f5;
        color: #6a1b9a;
        border: 1px solid #ce93d8;
      }
    }

    /* ⭐ Stock Lot Info */
    .lot-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;

      .lot-name {
        font-weight: 700;
        font-size: 14px;
        color: #212529;
      }

      .lot-status {
        font-size: 11px;
        padding: 3px 10px;
        border-radius: 4px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        &.active {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        &.completed {
          background: #cce5ff;
          color: #004085;
          border: 1px solid #b8daff;
        }
      }
    }

    .text-muted {
      color: #6c757d;
      font-size: 14px;
    }

    .quantity-cell {
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      background: #e9ecef;
      font-size: 14px;
      display: inline-block;
    }

    .success-text {
      color: #155724;
      background: #d4edda;
      border: 1px solid #c3e6cb;
    }

    .danger-text {
      color: #721c24;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;

      &.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      &.danger {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;

      &.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      &.danger {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .text-center {
      text-align: center;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      background: #f8f9fa;
      flex-shrink: 0;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 28px;
        font-weight: 500;
        font-size: 15px;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .btn-secondary {
        color: #6c757d;
      }

      .btn-primary {
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    /* ⭐ Scrollbar Styling */
    .modal-body::-webkit-scrollbar {
      width: 8px;
    }

    .modal-body::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .modal-body::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }

    .modal-body::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class StockCheckModalComponent {
  constructor(
    public dialogRef: MatDialogRef<StockCheckModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StockCheckModalData
  ) {}

  close(): void {
    this.dialogRef.close(false);
  }

  confirmDeductStock(): void {
    this.dialogRef.close(true);
  }
}
