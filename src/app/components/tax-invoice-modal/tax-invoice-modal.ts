import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface TaxInvoiceDialogData {
  order: any;
  sellerInfo?: SellerInfo;
}

export interface SellerInfo {
  companyName: string;
  branchName?: string;
  address: string;
  taxId: string;
  phone?: string;
}

export type InvoiceType = 'FULL' | 'ABBREVIATED';

@Component({
  selector: 'app-tax-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="modal-shell">

      <!-- CONTROL BAR -->
      <div class="control-bar">
        <div class="control-bar-left">
          <span class="ctrl-title">🧾 ออกใบกำกับภาษี</span>

          <div class="ctrl-group">
            <span class="ctrl-label">ประเภท</span>
            <div class="tab-switcher">
              <button [class.active]="invoiceType==='FULL'" (click)="invoiceType='FULL'">📄 แบบเต็ม</button>
              <button [class.active]="invoiceType==='ABBREVIATED'" (click)="invoiceType='ABBREVIATED'">📃 แบบย่อ</button>
            </div>
          </div>

          <div class="ctrl-group" *ngIf="invoiceType==='FULL'">
            <span class="ctrl-label">ฉบับ</span>
            <div class="tab-switcher">
              <button [class.active]="copyMode==='ORIGINAL'" (click)="copyMode='ORIGINAL'">🔖 ต้นฉบับ</button>
              <button [class.active]="copyMode==='COPY'" (click)="copyMode='COPY'">📋 สำเนา</button>
              <button [class.active]="copyMode==='BOTH'" (click)="copyMode='BOTH'">📑 ทั้งคู่</button>
            </div>
          </div>

          <button class="edit-toggle-btn" [class.editing]="editMode" (click)="editMode=!editMode">
            <span *ngIf="!editMode">✏️ แก้ไขข้อมูล</span>
            <span *ngIf="editMode">✅ บันทึก</span>
          </button>
        </div>

        <div class="control-bar-right">
          <button class="btn-print" (click)="openPrintWindow()">🖨 พิมพ์ / Export PDF</button>
          <button class="btn-close" (click)="onClose()">✕</button>
        </div>
      </div>

      <!-- PREVIEW AREA -->
      <div class="preview-scroll">

        <div class="a4-page" *ngIf="invoiceType==='FULL' && (copyMode==='ORIGINAL'||copyMode==='BOTH')">
          <ng-container *ngTemplateOutlet="fullTpl; context:{copyLabel:'ต้นฉบับใบกำกับภาษี / ใบเสร็จรับเงิน', isCopy:false}"></ng-container>
        </div>

        <div class="a4-page" *ngIf="invoiceType==='FULL' && (copyMode==='COPY'||copyMode==='BOTH')">
          <ng-container *ngTemplateOutlet="fullTpl; context:{copyLabel:'สำเนาใบกำกับภาษี / ใบเสร็จรับเงิน', isCopy:true}"></ng-container>
        </div>

        <div class="receipt-page" *ngIf="invoiceType==='ABBREVIATED'">
          <ng-container *ngTemplateOutlet="abbrTpl"></ng-container>
        </div>

      </div>
    </div>

    <!-- FULL INVOICE TEMPLATE -->
    <ng-template #fullTpl let-copyLabel="copyLabel" let-isCopy="isCopy">
      <div class="inv-full">
        <div class="copy-badge" [class.is-copy]="isCopy">
          {{ copyLabel }}<br><small>(Tax Invoice / Receipt)</small>
        </div>

        <div class="inv-header">
          <div class="seller-block">
            <div class="seller-logo-circle">
              <img src="/logo.jpg" alt="Logo"
                   (error)="onLogoError($event)" />
            </div>
            <div class="seller-text">
              <div *ngIf="!editMode" class="seller-name">{{ d.sellerName }}</div>
              <input *ngIf="editMode" type="text" [(ngModel)]="d.sellerName" class="inv-input seller-name-input" placeholder="ชื่อบริษัท" />
              <div *ngIf="!editMode" class="seller-branch">({{ d.sellerBranch }})</div>
              <input *ngIf="editMode" type="text" [(ngModel)]="d.sellerBranch" class="inv-input" placeholder="สำนักงานใหญ่" />
              <div *ngIf="!editMode" class="seller-meta">{{ d.sellerAddress }}</div>
              <textarea *ngIf="editMode" [(ngModel)]="d.sellerAddress" class="inv-input" rows="2" placeholder="ที่อยู่"></textarea>
              <div *ngIf="!editMode" class="seller-meta">เลขประจำตัวผู้เสียภาษี {{ d.sellerTaxId }}</div>
              <input *ngIf="editMode" type="text" [(ngModel)]="d.sellerTaxId" class="inv-input" placeholder="เลขภาษี" />
              <div *ngIf="!editMode" class="seller-meta">โทรศัพท์ {{ d.sellerPhone }}</div>
              <input *ngIf="editMode" type="text" [(ngModel)]="d.sellerPhone" class="inv-input" placeholder="โทรศัพท์" />
            </div>
          </div>
        </div>

        <div class="buyer-doc-row">
          <div class="buyer-cell">
            <table class="inner-tbl">
              <tr>
                <td class="lbl">นามลูกค้า :</td>
                <td>
                  <span *ngIf="!editMode">{{ d.buyerName }}</span>
                  <input *ngIf="editMode" type="text" [(ngModel)]="d.buyerName" class="inv-input" />
                </td>
              </tr>
              <tr>
                <td class="lbl">ที่อยู่ :</td>
                <td>
                  <span *ngIf="!editMode">{{ d.buyerAddress }}</span>
                  <textarea *ngIf="editMode" [(ngModel)]="d.buyerAddress" class="inv-input" rows="2"></textarea>
                </td>
              </tr>
              <tr>
                <td class="lbl">เลขภาษี :</td>
                <td>
                  <span *ngIf="!editMode">{{ d.buyerTaxId || '-' }}</span>
                  <input *ngIf="editMode" type="text" [(ngModel)]="d.buyerTaxId" class="inv-input" />
                </td>
              </tr>
              <tr>
                <td class="lbl">โทรศัพท์ :</td>
                <td>
                  <span *ngIf="!editMode">{{ d.buyerPhone || '-' }}</span>
                  <input *ngIf="editMode" type="text" [(ngModel)]="d.buyerPhone" class="inv-input" />
                </td>
              </tr>
            </table>
          </div>
          <div class="doc-cell">
            <table class="inner-tbl">
              <tr>
                <td class="lbl">เลขที่</td>
                <td>
                  <span *ngIf="!editMode">{{ d.docNumber }}</span>
                  <input *ngIf="editMode" type="text" [(ngModel)]="d.docNumber" class="inv-input" />
                </td>
              </tr>
              <tr>
                <td class="lbl">วันที่</td>
                <td>
                  <span *ngIf="!editMode">{{ d.docDate }}</span>
                  <input *ngIf="editMode" type="text" [(ngModel)]="d.docDate" class="inv-input" />
                </td>
              </tr>
              <tr>
                <td class="lbl">อ้างอิง</td>
                <td>
                  <span *ngIf="!editMode">{{ d.docRef || '-' }}</span>
                  <input *ngIf="editMode" type="text" [(ngModel)]="d.docRef" class="inv-input" />
                </td>
              </tr>
            </table>
          </div>
        </div>

        <table class="items-tbl">
          <thead>
          <tr>
            <th style="width:6%">ลำดับที่</th>
            <th style="width:10%">รหัสสินค้า</th>
            <th>รายละเอียด</th>
            <th style="width:7%">จำนวน</th>
            <th style="width:7%">หน่วย</th>
            <th style="width:12%">ราคา/หน่วย</th>
            <th style="width:9%">ส่วนลด</th>
            <th style="width:12%">จำนวนเงิน</th>
            <th style="width:4%" *ngIf="editMode"></th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let item of d.items; let i=index">
            <td class="tc">{{ i+1 }}</td>
            <td class="tc">
              <span *ngIf="!editMode">{{ item.sku || '-' }}</span>
              <input *ngIf="editMode" [(ngModel)]="item.sku" class="inv-input" />
            </td>
            <td>
              <span *ngIf="!editMode">{{ item.name }}</span>
              <input *ngIf="editMode" [(ngModel)]="item.name" class="inv-input" />
            </td>
            <td class="tc">
              <span *ngIf="!editMode">{{ item.qty }}</span>
              <input *ngIf="editMode" type="number" [(ngModel)]="item.qty" (input)="recalcItem(i)" class="inv-input tc" />
            </td>
            <td class="tc">
              <span *ngIf="!editMode">{{ item.unit }}</span>
              <input *ngIf="editMode" [(ngModel)]="item.unit" class="inv-input tc" />
            </td>
            <td class="tr">
              <span *ngIf="!editMode">{{ formatNum(item.price) }}</span>
              <input *ngIf="editMode" type="number" [(ngModel)]="item.price" (input)="recalcItem(i)" class="inv-input tr" />
            </td>
            <td class="tr">
              <span *ngIf="!editMode">{{ formatNum(item.discount) }}</span>
              <input *ngIf="editMode" type="number" [(ngModel)]="item.discount" (input)="recalcItem(i)" class="inv-input tr" />
            </td>
            <td class="tr">{{ formatNum(item.total) }}</td>
            <td class="tc" *ngIf="editMode">
              <button class="row-del-btn" (click)="removeItem(i)">✕</button>
            </td>
          </tr>
          <tr *ngIf="editMode">
            <td [attr.colspan]="editMode ? 9 : 8" class="add-row-cell">
              <button class="add-row-btn" (click)="addItem()">+ เพิ่มรายการ</button>
            </td>
          </tr>
          <tr *ngFor="let row of emptyRows" class="spacer-row">
            <td [attr.colspan]="editMode ? 9 : 8">&nbsp;</td>
          </tr>
          </tbody>
        </table>

        <div class="summary-row-wrapper">
          <div class="amount-words">{{ amountWords }}</div>
          <div class="summary-box">
            <table class="sum-tbl">
              <tr>
                <td class="slbl">จำนวนเงินทั้งสิ้น<br><small>TOTAL</small></td>
                <td class="sval">{{ formatNum(totals.subtotal) }}</td>
              </tr>
              <tr>
                <td class="slbl">ส่วนลด<br><small>DISCOUNT</small></td>
                <td class="sval">
                  <span *ngIf="!editMode">{{ formatNum(d.orderDiscount) }}</span>
                  <input *ngIf="editMode" type="number" [(ngModel)]="d.orderDiscount" (input)="recalcTotals()" class="inv-input tr" />
                </td>
              </tr>
              <tr>
                <td class="slbl">มูลค่าสินค้าหลังหักส่วนลด<br><small>TOTAL AMOUNT AFTER DISCOUNT</small></td>
                <td class="sval">{{ formatNum(totals.afterDiscount) }}</td>
              </tr>
              <tr *ngIf="d.vatEnabled">
                <td class="slbl">ภาษีมูลค่าเพิ่ม<br><small>VAT {{ d.vatRate }}%</small></td>
                <td class="sval">{{ formatNum(totals.vat) }}</td>
              </tr>
              <tr class="grand-row">
                <td class="slbl"><strong>ยอดรวมสุทธิ<br><small>GRAND TOTAL</small></strong></td>
                <td class="sval"><strong>{{ formatNum(totals.grand) }}</strong></td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Payment Box - Clickable -->
        <div class="payment-box">
          <div class="pay-title">การชำระเงินจะสมบูรณ์เมื่อบริษัทได้รับเงินเรียบร้อยแล้ว</div>

          <!-- เงินสด -->
          <div class="pay-row" [class.pay-selected]="d.payMethod==='CASH'">
            <span class="pay-check" (click)="setPayMethod('CASH')">{{ d.payMethod==='CASH' ? '☑' : '☐' }}</span>
            <span class="pay-label" (click)="setPayMethod('CASH')">เงินสด</span>
            <span class="pay-dots" (click)="$event.stopPropagation()">
              <span *ngIf="d.payMethod==='CASH'">
                <input type="number" [(ngModel)]="d.cashAmount" class="pay-input" placeholder="จำนวนเงิน"
                       (click)="$event.stopPropagation()" />
              </span>
              <span *ngIf="d.payMethod!=='CASH'">......................................................</span>
            </span>
            <span class="pay-unit">บาท</span>
          </div>

          <!-- เงินโอน -->
          <div class="pay-row" [class.pay-selected]="d.payMethod==='TRANSFER'">
            <span class="pay-check" (click)="setPayMethod('TRANSFER')">{{ d.payMethod==='TRANSFER' ? '☑' : '☐' }}</span>
            <span class="pay-label" (click)="setPayMethod('TRANSFER')">เงินโอนวันที่</span>
            <span class="pay-dots" (click)="$event.stopPropagation()">
              <span *ngIf="d.payMethod==='TRANSFER'">
                <input type="text" [(ngModel)]="d.transferDate" class="pay-input short" placeholder="วันที่"
                       (click)="$event.stopPropagation()" />
              </span>
              <span *ngIf="d.payMethod!=='TRANSFER'">...................</span>
            </span>
            <span class="pay-label-mid" (click)="setPayMethod('TRANSFER')">จำนวนเงิน</span>
            <span class="pay-dots" (click)="$event.stopPropagation()">
              <span *ngIf="d.payMethod==='TRANSFER'">
                <input type="number" [(ngModel)]="d.transferAmount" class="pay-input short" placeholder="จำนวน"
                       (click)="$event.stopPropagation()" />
              </span>
              <span *ngIf="d.payMethod!=='TRANSFER'">...................</span>
            </span>
            <span class="pay-unit">บาท</span>
          </div>

          <!-- เช็คธนาคาร -->
          <div class="pay-row" [class.pay-selected]="d.payMethod==='CHEQUE'">
            <span class="pay-check" (click)="setPayMethod('CHEQUE')">{{ d.payMethod==='CHEQUE' ? '☑' : '☐' }}</span>
            <span class="pay-label" (click)="setPayMethod('CHEQUE')">เช็คธนาคาร</span>
            <span class="pay-dots" (click)="$event.stopPropagation()">
              <span *ngIf="d.payMethod==='CHEQUE'">
                <input type="text" [(ngModel)]="d.chequeBank" class="pay-input short" placeholder="ชื่อธนาคาร"
                       (click)="$event.stopPropagation()" />
              </span>
              <span *ngIf="d.payMethod!=='CHEQUE'">...................</span>
            </span>
            <span class="pay-label-mid" (click)="setPayMethod('CHEQUE')">เลขที่</span>
            <span class="pay-dots" (click)="$event.stopPropagation()">
              <span *ngIf="d.payMethod==='CHEQUE'">
                <input type="text" [(ngModel)]="d.chequeNo" class="pay-input short" placeholder="เลขที่"
                       (click)="$event.stopPropagation()" />
              </span>
              <span *ngIf="d.payMethod!=='CHEQUE'">...................</span>
            </span>
            <span class="pay-unit">บาท</span>
          </div>
        </div>

        <!-- Footer: Notes + Signatures (เหมือน form จริง) -->
        <div class="foot-row">
          <div class="notes-box">
            <div class="notes-label">หมายเหตุ :</div>
            <div class="notes-content">
              <span *ngIf="!editMode">{{ d.notes }}</span>
              <textarea *ngIf="editMode" [(ngModel)]="d.notes" class="inv-input" rows="3"></textarea>
            </div>
          </div>
          <div class="sig-area">
            <div class="sig-box">
              <div class="sig-space"></div>
              <div class="sig-name-line">_________________________________</div>
              <div class="sig-role">ผู้ส่งสินค้า</div>
              <div class="sig-date-line">วันที่ ________________________</div>
            </div>
            <div class="sig-box">
              <div class="sig-space"></div>
              <div class="sig-name-line">_________________________________</div>
              <div class="sig-role">ผู้รับสินค้า</div>
              <div class="sig-date-line">วันที่ ________________________</div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>

    <!-- ABBREVIATED TEMPLATE -->
    <ng-template #abbrTpl>
      <div class="inv-abbr">
        <div class="abbr-head">
          <div *ngIf="!editMode" class="abbr-name">{{ d.sellerName }}</div>
          <input *ngIf="editMode" [(ngModel)]="d.sellerName" class="inv-input abbr-center-bold" />
          <div *ngIf="!editMode" class="abbr-branch">({{ d.sellerBranch }})</div>
          <input *ngIf="editMode" [(ngModel)]="d.sellerBranch" class="inv-input abbr-center" />
          <div *ngIf="!editMode" class="abbr-sub">{{ d.sellerAddress }}</div>
          <textarea *ngIf="editMode" [(ngModel)]="d.sellerAddress" class="inv-input" rows="2"></textarea>
          <div class="abbr-sub">เลขประจำตัวผู้เสียภาษี {{ d.sellerTaxId }}</div>
          <div class="abbr-title-bar">ใบเสร็จรับเงิน/ใบกำกับภาษีแบบย่อ</div>
        </div>

        <div class="abbr-doc-info">
          <div>เลขที่เอกสาร:
            <span *ngIf="!editMode">{{ d.docNumber }}</span>
            <input *ngIf="editMode" [(ngModel)]="d.docNumber" class="inv-input abbr-inline" />
          </div>
          <div>วันที่ขาย:
            <span *ngIf="!editMode">{{ d.docDate }}</span>
            <input *ngIf="editMode" [(ngModel)]="d.docDate" class="inv-input abbr-inline" />
          </div>
        </div>
        <hr class="dashed-hr" />

        <table class="abbr-tbl">
          <thead>
          <tr>
            <th style="text-align:left">รายการ</th>
            <th style="text-align:right">หน่วยละ</th>
            <th style="text-align:right">รวมเงิน</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let item of d.items; let i=index">
            <td>
              <span *ngIf="!editMode">{{ item.name }}</span>
              <input *ngIf="editMode" [(ngModel)]="item.name" class="inv-input" />
              <div class="abbr-item-sub">
                รายการ: {{ i+1 }} จำนวนชิ้น :
                <span *ngIf="!editMode">{{ item.qty }}</span>
                <input *ngIf="editMode" type="number" [(ngModel)]="item.qty" (input)="recalcItem(i)" class="inv-input abbr-qty" />
              </div>
            </td>
            <td class="tr">
              <span *ngIf="!editMode">{{ formatNum(item.price) }}</span>
              <input *ngIf="editMode" type="number" [(ngModel)]="item.price" (input)="recalcItem(i)" class="inv-input tr" />
            </td>
            <td class="tr">{{ formatNum(item.total) }}</td>
          </tr>
          </tbody>
        </table>
        <hr class="dashed-hr" />

        <div class="abbr-sum">
          <div class="abbr-sum-r"><span>รวมเป็นเงิน</span><span>{{ formatNum(totals.subtotal) }}</span></div>
          <div class="abbr-sum-r"><span>ส่วนลด</span><span>{{ formatNum(d.orderDiscount) }}</span></div>
          <div class="abbr-sum-r abbr-bold"><span>รวมทั้งสิ้น</span><span>{{ formatNum(totals.afterDiscount) }}</span></div>
          <hr class="dashed-hr" />
          <div class="abbr-sum-r"><span>รวมมูลค่าสินค้า</span><span>{{ formatNum(totals.afterDiscount) }}</span></div>
          <div class="abbr-sum-r" *ngIf="d.vatEnabled"><span>ภาษีมูลค่าเพิ่ม</span><span>{{ formatNum(totals.vat) }}</span></div>
        </div>
        <div class="abbr-footer">ขอบคุณที่ใช้บริการ</div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      font-family: 'Sarabun', 'Noto Sans Thai', sans-serif;
    }

    .modal-shell {
      display: flex;
      flex-direction: column;
      height: 95vh;
      background: #1e1e2e;
    }

    .control-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      background: #1e1e2e;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .control-bar-left {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .control-bar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ctrl-title {
      color: white;
      font-weight: 700;
      font-size: 1rem;
      white-space: nowrap;
    }

    .ctrl-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ctrl-label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.75rem;
    }

    .tab-switcher {
      display: flex;
      border-radius: 7px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .tab-switcher button {
      background: rgba(255, 255, 255, 0.05);
      border: none;
      color: rgba(255, 255, 255, 0.6);
      padding: 6px 11px;
      font-size: 0.78rem;
      cursor: pointer;
      font-family: 'Sarabun', sans-serif;
      transition: all 0.15s;
    }

    .tab-switcher button:not(:last-child) {
      border-right: 1px solid rgba(255, 255, 255, 0.15);
    }

    .tab-switcher button.active {
      background: #3182ce;
      color: white;
    }

    .edit-toggle-btn {
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.07);
      color: white;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 0.78rem;
      font-family: 'Sarabun', sans-serif;
      transition: all 0.15s;
    }

    .edit-toggle-btn.editing {
      background: #276749;
      border-color: #48bb78;
    }

    .btn-print {
      padding: 7px 16px;
      border-radius: 6px;
      border: none;
      background: #2b6cb0;
      color: white;
      font-size: 0.8rem;
      cursor: pointer;
      font-family: 'Sarabun', sans-serif;
    }

    .btn-print:hover {
      background: #2c5282;
    }

    .btn-close {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: white;
      cursor: pointer;
    }

    .btn-close:hover {
      background: rgba(200, 0, 0, 0.4);
    }

    .preview-scroll {
      flex: 1;
      overflow-y: auto;
      background: #2d2d3d;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    .a4-page {
      width: 210mm;
      min-height: 297mm;
      background: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      border-radius: 2px;
      padding: 14mm 14mm 10mm 14mm;
      box-sizing: border-box;
      position: relative;
      font-size: 9.5pt;
      line-height: 1.45;
    }

    .receipt-page {
      width: 80mm;
      background: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      border-radius: 2px;
      padding: 6mm 8mm;
      box-sizing: border-box;
      font-size: 9pt;
    }

    .copy-badge {
      position: absolute;
      top: 8mm;
      right: 12mm;
      border: 2px solid #333;
      padding: 4px 10px;
      text-align: center;
      font-size: 8.5pt;
      font-weight: bold;
      background: white;
      line-height: 1.4;
    }

    .copy-badge.is-copy {
      border-color: #c05621;
      background: #fffbeb;
      color: #c05621;
    }

    .inv-header {
      margin-bottom: 6mm;
      padding-right: 62mm;
    }

    .seller-block {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .seller-logo-circle {
      width: 120px;
      height: 120px;
      color: white;
      font-weight: bold;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }

    .seller-logo-circle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .seller-name {
      font-weight: bold;
      font-size: 12pt;
    }

    .seller-branch {
      font-size: 9.5pt;
    }

    .seller-meta {
      font-size: 8.5pt;
      color: #444;
    }

    .buyer-doc-row {
      display: flex;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4mm;
    }

    .buyer-cell {
      flex: 1;
      padding: 6px 10px;
    }

    .doc-cell {
      border-left: 1px solid #ccc;
      padding: 6px 10px;
      min-width: 130px;
    }

    .inner-tbl {
      border-collapse: collapse;
      width: 100%;
    }

    .inner-tbl td {
      padding: 2px 4px;
      font-size: 8.5pt;
      vertical-align: top;
    }

    .lbl {
      font-weight: 600;
      white-space: nowrap;
      min-width: 80px;
    }

    .items-tbl {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 4mm;
    }

    .items-tbl th {
      background: #f0f0f0;
      border: 1px solid #bbb;
      padding: 4px 5px;
      font-size: 8.5pt;
      text-align: center;
    }

    .items-tbl td {
      border: 1px solid #ddd;
      padding: 3px 5px;
      font-size: 8.5pt;
    }

    .spacer-row td {
      height: 14px;
    }

    .tc {
      text-align: center;
    }

    .tr {
      text-align: right;
    }

    .add-row-cell {
      background: #f7fafc;
    }

    .add-row-btn {
      width: 100%;
      padding: 4px;
      border: 1px dashed #3182ce;
      border-radius: 4px;
      background: transparent;
      color: #3182ce;
      cursor: pointer;
      font-size: 8pt;
      font-family: 'Sarabun', sans-serif;
    }

    .row-del-btn {
      background: #fed7d7;
      border: none;
      border-radius: 3px;
      color: #c53030;
      cursor: pointer;
      width: 20px;
      height: 20px;
      font-size: 9pt;
    }

    .summary-row-wrapper {
      display: flex;
      gap: 4mm;
      margin-bottom: 3mm;
    }

    .amount-words {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 8.5pt;
      font-style: italic;
      display: flex;
      align-items: center;
    }

    .summary-box {
      min-width: 260px;
    }

    .sum-tbl {
      width: 100%;
      border-collapse: collapse;
    }

    .sum-tbl tr {
      border: 1px solid #ddd;
    }

    .slbl {
      padding: 3px 8px;
      font-size: 8pt;
      border-right: 1px solid #ddd;
    }

    .slbl small {
      color: #888;
    }

    .sval {
      padding: 3px 8px;
      text-align: right;
      font-size: 8.5pt;
      min-width: 80px;
    }

    .grand-row {
      background: #f0f0f0;
    }

    .payment-box {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 6px 10px;
      margin-bottom: 3mm;
      font-size: 8.5pt;
    }

    .pay-title {
      margin-bottom: 5px;
      color: #555;
      font-size: 8pt;
    }

    .pay-row {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 3px 5px;
      border-radius: 3px;
      cursor: pointer;
      transition: background 0.12s;
      border: 1px solid transparent;
      margin-bottom: 2px;
      line-height: 1.7;
    }

    .pay-row:hover {
      background: rgba(49, 130, 206, 0.05);
    }

    .pay-selected {
      background: #ffffff !important;
    }

    .pay-check {
      font-size: 10pt;
      flex-shrink: 0;
      width: 18px;
    }

    .pay-label {
      white-space: nowrap;
      flex-shrink: 0;
      min-width: 60px;
    }

    .pay-label-mid {
      white-space: nowrap;
      flex-shrink: 0;
      margin: 0 3px;
    }

    .pay-dots {
      flex: 1;
      color: #555;
      overflow: hidden;
    }

    .pay-unit {
      white-space: nowrap;
      flex-shrink: 0;
      margin-left: 4px;
    }

    .pay-input {
      border: none;
      border-bottom: 1px dashed #ffffff;
      outline: none;
      background: transparent;
      font-size: 8.5pt;
      font-family: 'Sarabun', sans-serif;
      width: 100%;
      padding: 0 2px;
      color: #1a202c;
    }

    .pay-input.short {
      width: 100px;
    }

    /* FOOTER - form-matching layout */
    .foot-row {
      display: flex;
      gap: 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 2mm;
    }

    .notes-box {
      flex: 1;
      padding: 8px 10px;
      font-size: 8pt;
      border-right: 1px solid #ddd;
      min-height: 56px;
    }

    .notes-label {
      font-weight: 700;
      font-size: 8pt;
      margin-bottom: 3px;
    }

    .notes-content {
      line-height: 1.6;
      color: #333;
    }

    .sig-area {
      display: flex;
      flex-direction: row;
    }

    .sig-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding: 6px 10px 8px;
      min-width: 115px;
      border-left: 1px solid #ddd;
      text-align: center;
    }

    .sig-space {
      flex: 1;
      min-height: 20px;
    }

    .sig-name-line {
      font-size: 7.5pt;
      color: #555;
      margin-bottom: 0px;
      letter-spacing: 1px;
    }

    .sig-role {
      font-size: 8.5pt;
      font-weight: 600;
      margin: 3px 0 2px;
    }

    .sig-date-line {
      font-size: 7.5pt;
      color: #888;
    }

    .abbr-head {
      text-align: center;
      margin-bottom: 4mm;
    }

    .abbr-name {
      font-weight: bold;
      font-size: 11pt;
    }

    .abbr-branch {
      font-size: 9pt;
    }

    .abbr-sub {
      font-size: 8.5pt;
    }

    .abbr-title-bar {
      font-weight: bold;
      font-size: 9.5pt;
      border-top: 1px dashed #999;
      border-bottom: 1px dashed #999;
      padding: 2px 0;
      margin-top: 4px;
    }

    .abbr-doc-info {
      margin: 3mm 0;
      font-size: 8.5pt;
    }

    .dashed-hr {
      border: none;
      border-top: 1px dashed #999;
      margin: 3mm 0;
    }

    .abbr-tbl {
      width: 100%;
      border-collapse: collapse;
    }

    .abbr-tbl th {
      font-size: 8.5pt;
      border-bottom: 1px solid #ccc;
      padding: 3px 4px;
    }

    .abbr-tbl td {
      font-size: 8.5pt;
      padding: 2px 4px;
      vertical-align: top;
    }

    .abbr-item-sub {
      font-size: 7.5pt;
      color: #666;
    }

    .abbr-sum {
      margin-top: 3mm;
    }

    .abbr-sum-r {
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      padding: 1px 0;
    }

    .abbr-bold span {
      font-weight: bold;
    }

    .abbr-footer {
      text-align: center;
      font-size: 9pt;
      margin-top: 6mm;
      color: #555;
    }

    .inv-input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #bee3f8;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 8.5pt;
      font-family: 'Sarabun', sans-serif;
      background: #ebf8ff;
      outline: none;
      margin-bottom: 1px;
    }

    .inv-input:focus {
      border-color: #3182ce;
      background: #fff;
    }

    .seller-name-input {
      font-weight: bold;
      font-size: 11pt;
    }

    .abbr-center-bold {
      text-align: center;
      font-weight: bold;
      font-size: 11pt;
    }

    .abbr-center {
      text-align: center;
    }

    .abbr-inline {
      width: auto;
      display: inline-block;
    }

    .abbr-qty {
      width: 40px;
      display: inline-block;
    }

    textarea.inv-input {
      resize: vertical;
    }
  `]
})
export class TaxInvoiceModalComponent implements OnInit {
  invoiceType: InvoiceType = 'FULL';
  copyMode: string = 'ORIGINAL';
  editMode: boolean = false;

  d: any = {};
  totals: any = { subtotal: 0, afterDiscount: 0, vat: 0, grand: 0 };
  emptyRows: null[] = [];
  amountWords: string = '';

  constructor(
    private dialogRef: MatDialogRef<TaxInvoiceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaxInvoiceDialogData
  ) {}

  ngOnInit(): void {
    this.initData();
    this.recalcTotals();
  }

  initData(): void {
    const o = this.data.order;
    const s = this.data.sellerInfo;
    this.d = {
      sellerName:     s?.companyName   || 'นายอาทิตย์ จันขุน',
      sellerBranch:   s?.branchName    || 'สำนักงานใหญ่',
      sellerAddress:  s?.address       || '342/125 ซอยแจ้งวัฒนะ 14 แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210',
      sellerTaxId:    s?.taxId         || '1100201572459',
      sellerPhone:    s?.phone         || '062-2170101',
      buyerName:      o.customerName   || '',
      buyerAddress:   o.shippingAddress || '',
      buyerPhone:     o.customerPhone  || '',
      buyerTaxId:     '',
      docNumber:      o.orderNumber    || '',
      docDate:        this.toDateTH(o.orderDate),
      docRef:         o.trackingNumber || '',
      paymentStatus:  o.paymentStatus  || 'UNPAID',
      paymentDateStr: this.toDateTH(o.paymentDate || o.orderDate),
      vatEnabled:     o.vatEnabled     || false,
      vatRate:        o.vatRate        || 7,
      orderDiscount:  parseFloat(o.discount) || 0,
      notes:          o.notes || 'เงื่อนไขการชำระเงิน เครดิต 7 วัน (ชำระตามรอบจ่าย)',
      // payment method selection
      payMethod:      o.paymentStatus === 'PAID' ? 'TRANSFER' : '',
      cashAmount:     0,
      transferDate:   this.toDateTH(o.paymentDate || o.orderDate),
      transferAmount: 0,
      chequeBank:     '',
      chequeNo:       '',
      items: (o.orderItems || []).map((it: any) => ({
        sku:      it.productSku  || '',
        name:     it.productName || '',
        qty:      it.quantity    || 0,
        unit:     'PCS.',
        price:    parseFloat(it.unitPrice) || 0,
        discount: parseFloat(it.discount)  || 0,
        total:    parseFloat(it.totalPrice) || 0
      }))
    };
  }

  recalcItem(i: number): void {
    const it = this.d.items[i];
    it.total = Math.max(0, (it.qty || 0) * (it.price || 0) - (it.discount || 0));
    this.recalcTotals();
  }

  recalcTotals(): void {
    const sub  = (this.d.items as any[]).reduce((s: number, it: any) => s + (it.total || 0), 0);
    const disc = this.d.orderDiscount || 0;
    const ship = parseFloat(this.data.order?.shippingFee) || 0;
    const base = Math.max(0, sub - disc) + ship;
    const vat  = this.d.vatEnabled ? base * (this.d.vatRate / 100) : 0;
    this.totals = { subtotal: sub, afterDiscount: base, vat: vat, grand: base + vat };
    this.amountWords = this.toThaiWords(base + vat);
    this.emptyRows = Array(Math.max(0, 8 - (this.d.items as any[]).length)).fill(null);
  }

  setPayMethod(method: string): void {
    this.d.payMethod = this.d.payMethod === method ? '' : method;
    // auto-fill amounts from totals
    if (method === 'CASH' && !this.d.cashAmount) this.d.cashAmount = this.totals.grand;
    if (method === 'TRANSFER' && !this.d.transferAmount) this.d.transferAmount = this.totals.grand;
  }

  syncCashAmount(): void { /* triggered on input change */ }

  addItem(): void {
    this.d.items.push({ sku: '', name: '', qty: 1, unit: 'PCS.', price: 0, discount: 0, total: 0 });
    this.recalcTotals();
  }

  removeItem(i: number): void {
    (this.d.items as any[]).splice(i, 1);
    this.recalcTotals();
  }

  formatNum(v: any): string {
    return (parseFloat(v) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  toDateTH(date: any): string {
    if (!date) return '-';
    const dt = new Date(date);
    const months = [
      'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
      'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
    ];
    return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear() + 543}`;
  }

  openPrintWindow(): void {
    const html = this.buildPrintHtml();
    const win = window.open('', '_blank', 'width=900,height=750,scrollbars=yes');
    if (!win) {
      alert('กรุณาอนุญาต Popup window ในเบราว์เซอร์ก่อน');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 700);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      parent.innerHTML = 'CC';
    }
  }

  buildPrintHtml(): string {
    const d = this.d;
    const t = this.totals;
    const isFull   = this.invoiceType === 'FULL';
    const showOrig = isFull && (this.copyMode === 'ORIGINAL' || this.copyMode === 'BOTH');
    const showCopy = isFull && (this.copyMode === 'COPY'     || this.copyMode === 'BOTH');
    const showAbbr = !isFull;

    const css = `
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Sarabun','Noto Sans Thai',sans-serif;background:white;
           -webkit-print-color-adjust:exact;print-color-adjust:exact}
      .page{width:210mm;min-height:297mm;padding:12mm 14mm 10mm 14mm;
            position:relative;font-size:9.5pt;line-height:1.55;
            page-break-after:always;margin:0 auto}
      .abbr-page{width:80mm;min-height:auto;padding:6mm 8mm;page-break-after:avoid}

      /* badge top-right */
      .badge{position:absolute;top:10mm;right:12mm;border:2px solid #333;
             padding:5px 12px;text-align:center;font-size:8.5pt;font-weight:bold;
             background:white;line-height:1.5;min-width:130px}
      .badge.copy{border-color:#c05621;background:#fffbeb;color:#c05621}

      /* seller logo */
      .sc{width:120px;height:120px;flex-shrink:0;overflow:hidden;
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:bold;font-size:14px}
      .sc img{width:120px;height:120px;object-fit:cover;display:block}

      /* seller header */
      .sh{display:flex;gap:12px;align-items:flex-start;margin-bottom:5mm;padding-right:68mm}
      .sn{font-weight:bold;font-size:12pt;line-height:1.3}
      .smeta{font-size:8.5pt;color:#444;margin-top:1px}

      /* buyer/doc */
      .bd{display:flex;border:1px solid #bbb;border-radius:3px;overflow:hidden;margin-bottom:4mm}
      .bc{flex:1;padding:6px 10px}
      .dc{border-left:1px solid #bbb;padding:6px 10px;min-width:145px}
      .it2{width:100%;border-collapse:collapse}
      .it2 td{padding:2px 5px;font-size:8.5pt;vertical-align:top}
      .lb{font-weight:600;white-space:nowrap;min-width:75px}

      /* items table */
      .it{width:100%;border-collapse:collapse;margin-bottom:4mm}
      .it th{background:#f0f0f0;border:1px solid #bbb;padding:4px 6px;font-size:8.5pt;
             text-align:center;font-weight:600;white-space:nowrap}
      .it td{border:1px solid #ddd;padding:3px 6px;font-size:8.5pt}
      .tc{text-align:center}.tr{text-align:right}

      /* summary section */
      .sw{display:flex;gap:4mm;margin-bottom:3mm;align-items:stretch}
      .aw{flex:1;border:1px solid #ddd;border-radius:3px;padding:8px 10px;
          font-size:9pt;font-style:italic;display:flex;align-items:center;
          word-break:break-word;line-height:1.7;min-height:40px}
      .st{border-collapse:collapse;width:220px;flex-shrink:0;align-self:flex-start}
      .st tr{border:1px solid #ddd}
      .sl{padding:4px 8px;font-size:7.5pt;border-right:1px solid #ddd}
      .sl small{color:#888;display:block;line-height:1.2}
      .sv{padding:4px 8px;text-align:right;font-size:9pt;white-space:nowrap}
      .gr{background:#f0f0f0}

      /* payment */
      .pb{border:1px solid #ffffff;border-radius:3px;padding:6px 10px;
          margin-bottom:3mm;font-size:8.5pt;line-height:1.9}
      .pr{display:flex;align-items:baseline;gap:4px;padding:1px 4px;
          border-radius:2px;border:1px solid transparent}
      .hi{background:#ffffff!important;border-color:#ffffff!important}

      /* footer */
      .ft{display:flex;gap:0;border:1px solid #ddd;border-radius:3px;
          overflow:hidden;margin-top:2mm;min-height:60px}
      .nb{flex:1;padding:8px 10px;font-size:8pt;border-right:1px solid #ddd;line-height:1.6}
      .sg{display:flex;flex-direction:row}
      .sb{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;
          padding:6px 10px 8px;min-width:115px;border-left:1px solid #ddd;text-align:center}

      /* abbr */
      .at{width:100%;border-collapse:collapse}
      .at th{font-size:8.5pt;border-bottom:1px solid #ccc;padding:3px 4px;font-weight:600}
      .at td{font-size:8.5pt;padding:3px 4px;vertical-align:top}
      .dh{border:none;border-top:1px dashed #999;margin:3mm 0}
      .ar{display:flex;justify-content:space-between;font-size:8.5pt;padding:2px 0}

      @page{size:A4 portrait;margin:0}
      @media print{
        *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
        body{margin:0}
        .page{margin:0;page-break-after:always}
        .abbr-page{page-break-after:avoid}
      }
    `;

    const mkTbl = (rows: string): string =>
      `<table style="border-collapse:collapse;width:100%">${rows}</table>`;

    const mkRow = (a: string, b: string): string =>
      `<tr><td class="lb">${a}</td><td style="font-size:8.5pt;padding:2px 4px">${b}</td></tr>`;

    const itemsHtml = (d.items as any[]).map((it: any, i: number) => `
      <tr>
        <td class="tc">${i + 1}</td>
        <td class="tc">${it.sku || '-'}</td>
        <td>${it.name}</td>
        <td class="tc">${it.qty}</td>
        <td class="tc">${it.unit}</td>
        <td class="tr">${this.formatNum(it.price)}</td>
        <td class="tr">${this.formatNum(it.discount)}</td>
        <td class="tr">${this.formatNum(it.total)}</td>
      </tr>`).join('');

    const emptyHtml = Array(Math.max(0, 8 - (d.items as any[]).length))
      .fill('<tr><td colspan="8" style="height:14px"></td></tr>').join('');

    const abbrItemsHtml = (d.items as any[]).map((it: any, i: number) => `
      <tr>
        <td>${it.name}<div style="font-size:7.5pt;color:#666">รายการ: ${i + 1} จำนวนชิ้น : ${it.qty}</div></td>
        <td class="tr">${this.formatNum(it.price)}</td>
        <td class="tr">${this.formatNum(it.total)}</td>
      </tr>`).join('');

    const buildFullPage = (label: string, isCopy: boolean): string => `
      <div class="page">
        <div class="badge${isCopy ? ' copy' : ''}">
          ${label}<br><small>(Tax Invoice / Receipt)</small>
        </div>

        <!-- Seller Header -->
        <div class="sh">
          <div class="sc">
            <img src="/logo.jpg" alt="Logo" onerror="this.style.display='none';this.parentElement.innerHTML='CC'" />
          </div>
          <div>
            <div class="sn">${d.sellerName}</div>
            <div style="font-size:9.5pt">(${d.sellerBranch})</div>
            <div class="smeta">${d.sellerAddress}</div>
            <div class="smeta">เลขประจำตัวผู้เสียภาษี ${d.sellerTaxId}</div>
            <div class="smeta">โทรศัพท์ ${d.sellerPhone}</div>
          </div>
        </div>

        <!-- Buyer + Doc -->
        <div class="bd">
          <div class="bc">${mkTbl(
      mkRow('นามลูกค้า :', d.buyerName) +
      mkRow('ที่อยู่ :', d.buyerAddress) +
      mkRow('เลขภาษี :', d.buyerTaxId || '-') +
      mkRow('โทรศัพท์ :', d.buyerPhone || '-')
    )}</div>
          <div class="dc">${mkTbl(
      mkRow('เลขที่', d.docNumber) +
      mkRow('วันที่', d.docDate) +
      mkRow('อ้างอิง', d.docRef || '-')
    )}</div>
        </div>

        <!-- Items Table -->
        <table class="it">
          <thead><tr>
            <th style="width:6%">ลำดับที่</th>
            <th style="width:10%">รหัสสินค้า</th>
            <th>รายละเอียด</th>
            <th style="width:7%">จำนวน</th>
            <th style="width:7%">หน่วย</th>
            <th style="width:12%">ราคา/หน่วย</th>
            <th style="width:9%">ส่วนลด</th>
            <th style="width:12%">จำนวนเงิน</th>
          </tr></thead>
          <tbody>${itemsHtml}${emptyHtml}</tbody>
        </table>

        <!-- Summary -->
        <div class="sw">
          <div class="aw">${this.amountWords}</div>
          <table class="st">
            <tr><td class="sl">จำนวนเงินทั้งสิ้น<br><small>TOTAL</small></td><td class="sv">${this.formatNum(t.subtotal)}</td></tr>
            <tr><td class="sl">ส่วนลด<br><small>DISCOUNT</small></td><td class="sv">${this.formatNum(d.orderDiscount)}</td></tr>
            <tr><td class="sl">มูลค่าสินค้าหลังหักส่วนลด<br><small>TOTAL AMOUNT AFTER DISCOUNT</small></td><td class="sv">${this.formatNum(t.afterDiscount)}</td></tr>
            ${d.vatEnabled ? `<tr><td class="sl">ภาษีมูลค่าเพิ่ม<br><small>VAT ${d.vatRate}%</small></td><td class="sv">${this.formatNum(t.vat)}</td></tr>` : ''}
            <tr class="gr"><td class="sl"><strong>ยอดรวมสุทธิ<br><small>GRAND TOTAL</small></strong></td><td class="sv"><strong>${this.formatNum(t.grand)}</strong></td></tr>
          </table>
        </div>

        <!-- Payment -->
        <div class="pb">
          <div style="font-size:8pt;color:#555;margin-bottom:4px">การชำระเงินจะสมบูรณ์เมื่อบริษัทได้รับเงินเรียบร้อยแล้ว</div>
          <div class="${d.payMethod === 'CASH' ? 'pr hi' : 'pr'}">
            ${d.payMethod === 'CASH' ? '☑' : '☐'}
            เงินสด
            <span style="flex:1;border-bottom:1px dashed #999;margin:0 4px;display:inline-block;min-width:80px">
              ${d.payMethod === 'CASH' ? this.formatNum(d.cashAmount || t.grand) : ''}
            </span>
            บาท
          </div>
          <div class="${d.payMethod === 'TRANSFER' ? 'pr hi' : 'pr'}">
            ${d.payMethod === 'TRANSFER' ? '☑' : '☐'}
            เงินโอนวันที่
            <span style="flex:1;border-bottom:1px dashed #999;margin:0 4px;display:inline-block;min-width:70px">
              ${d.payMethod === 'TRANSFER' ? (d.transferDate || d.paymentDateStr) : ''}
            </span>
            จำนวนเงิน
            <span style="flex:1;border-bottom:1px dashed #999;margin:0 4px;display:inline-block;min-width:70px">
              ${d.payMethod === 'TRANSFER' ? this.formatNum(d.transferAmount || t.grand) : ''}
            </span>
            บาท
          </div>
          <div class="${d.payMethod === 'CHEQUE' ? 'pr hi' : 'pr'}">
            ${d.payMethod === 'CHEQUE' ? '☑' : '☐'}
            เช็คธนาคาร
            <span style="flex:1;border-bottom:1px dashed #999;margin:0 4px;display:inline-block;min-width:70px">
              ${d.payMethod === 'CHEQUE' ? (d.chequeBank || '') : ''}
            </span>
            เลขที่
            <span style="flex:1;border-bottom:1px dashed #999;margin:0 4px;display:inline-block;min-width:70px">
              ${d.payMethod === 'CHEQUE' ? (d.chequeNo || '') : ''}
            </span>
            บาท
          </div>
        </div>

        <!-- Footer: Notes + Signatures (form-matching) -->
        <div class="ft">
          <div class="nb">
            <div style="font-weight:700;font-size:8pt;margin-bottom:4px">หมายเหตุ :</div>
            <div style="font-size:8pt;line-height:1.6">${d.notes}</div>
          </div>
          <div class="sg">
            <div class="sb">
              <div style="height:28px"></div>
              <div style="font-size:7.5pt;border-bottom:1px;padding-bottom:1px;">_________________________________</div>
              <div style="font-size:8.5pt;font-weight:600;margin:3px 0 1px">ผู้ส่งสินค้า</div>
              <div style="font-size:7.5pt;color:#888">วันที่ ____________________</div>
            </div>
            <div class="sb">
              <div style="height:28px"></div>
              <div style="font-size:7.5pt;border-bottom:1px padding-bottom:1px;">_________________________________</div>
              <div style="font-size:8.5pt;font-weight:600;margin:3px 0 1px">ผู้รับสินค้า</div>
              <div style="font-size:7.5pt;color:#888">วันที่ ____________________</div>
            </div>
          </div>
        </div>
      </div>`;

    const abbrPageHtml = `
      <div class="page abbr-page">
        <div style="text-align:center;margin-bottom:4mm">
          <div style="font-weight:bold;font-size:11pt">${d.sellerName}</div>
          <div style="font-size:9pt">(${d.sellerBranch})</div>
          <div style="font-size:8.5pt">${d.sellerAddress}</div>
          <div style="font-size:8.5pt">เลขประจำตัวผู้เสียภาษี ${d.sellerTaxId}</div>
          <div style="font-weight:bold;font-size:9.5pt;border-top:1px dashed #999;border-bottom:1px dashed #999;padding:2px 0;margin-top:4px">
            ใบเสร็จรับเงิน/ใบกำกับภาษีแบบย่อ
          </div>
        </div>
        <div style="margin:3mm 0;font-size:8.5pt">
          <div>เลขที่เอกสาร: ${d.docNumber}</div>
          <div>วันที่ขาย: ${d.docDate}</div>
        </div>
        <hr class="dh"/>
        <table class="at">
          <thead><tr>
            <th style="width:55%;text-align:left">รายการ</th>
            <th style="width:22%;text-align:right">หน่วยละ</th>
            <th style="width:23%;text-align:right">รวมเงิน</th>
          </tr></thead>
          <tbody>${abbrItemsHtml}</tbody>
        </table>
        <hr class="dh"/>
        <div class="ar"><span>รวมเป็นเงิน</span><span>${this.formatNum(t.subtotal)}</span></div>
        <div class="ar"><span>ส่วนลด</span><span>${this.formatNum(d.orderDiscount)}</span></div>
        <div class="ar" style="font-weight:bold"><span>รวมทั้งสิ้น</span><span>${this.formatNum(t.afterDiscount)}</span></div>
        <hr class="dh"/>
        <div class="ar"><span>รวมมูลค่าสินค้า</span><span>${this.formatNum(t.afterDiscount)}</span></div>
        ${d.vatEnabled ? `<div class="ar"><span>ภาษีมูลค่าเพิ่ม</span><span>${this.formatNum(t.vat)}</span></div>` : ''}
        <div style="text-align:center;font-size:9pt;margin-top:6mm;color:#555">ขอบคุณที่ใช้บริการ</div>
      </div>`;

    return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>ใบกำกับภาษี - ${d.docNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>
  ${showOrig ? buildFullPage('ต้นฉบับใบกำกับภาษี / ใบเสร็จรับเงิน', false) : ''}
  ${showCopy ? buildFullPage('สำเนาใบกำกับภาษี / ใบเสร็จรับเงิน', true) : ''}
  ${showAbbr ? abbrPageHtml : ''}
</body>
</html>`;
  }

  toThaiWords(amount: number): string {
    if (!amount) return 'ศูนย์บาทถ้วน';
    const intPart = Math.floor(amount);
    const decPart = Math.round((amount - intPart) * 100);
    const baht = this.numToWords(intPart);
    const satang = decPart > 0 ? this.numToWords(decPart) + 'สตางค์' : 'ถ้วน';
    return baht + 'บาท' + satang;
  }

  numToWords(n: number): string {
    if (!n) return '';
    const ones = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const places = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
    if (n >= 1000000) {
      return this.numToWords(Math.floor(n / 1000000)) + 'ล้าน' + this.numToWords(n % 1000000);
    }
    const digits = n.toString().split('').map(Number);
    const len = digits.length;
    let result = '';
    for (let i = 0; i < len; i++) {
      const digit = digits[i];
      const place = len - i - 1;
      if (!digit) continue;
      if (place === 1 && digit === 2) result += 'ยี่';
      else if (place === 1 && digit === 1) result += '';
      else if (place === 0 && digit === 1 && len > 1) result += 'เอ็ด';
      else result += ones[digit];
      result += places[place];
    }
    return result;
  }
}
