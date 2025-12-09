import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderService, Order } from '../../services/order.service';
import { TransactionService } from "../../services/transaction.service";
import { StockCheckModalComponent } from '../stock-check-modal/stock-check-modal';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.css']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading: boolean = true;
  orderId: number | null = null;

  // ⭐ NEW: สถานะการตัด Stock
  stockDeductionStatus: any = null;
  loadingStockStatus: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private transactionService: TransactionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.orderId) {
      this.loadOrder();
      this.loadStockDeductionStatus(); // ⭐ โหลดสถานะการตัด Stock
    }
  }

  loadOrder(): void {
    if (this.orderId) {
      this.loading = true;
      this.orderService.getOrderById(this.orderId).subscribe({
        next: (order) => {
          this.order = order;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading order:', error);
          this.loading = false;
          alert('ไม่พบออเดอร์');
          this.router.navigate(['/orders']);
        }
      });
    }
  }

  /**
   * ⭐ NEW: โหลดสถานะการตัด Stock
   */
  loadStockDeductionStatus(): void {
    if (!this.orderId) return;

    this.loadingStockStatus = true;
    this.orderService.getStockDeductionStatus(this.orderId).subscribe({
      next: (status) => {
        this.stockDeductionStatus = status;
        this.loadingStockStatus = false;
        console.log('Stock Deduction Status:', status);
      },
      error: (error) => {
        console.error('Error loading stock status:', error);
        this.loadingStockStatus = false;
        // Set default values
        this.stockDeductionStatus = {
          canDeduct: true,
          canRestore: false,
          allCompleted: false,
          totalItems: 0,
          completedCount: 0
        };
      }
    });
  }

  /**
   * ⭐ NEW: ตรวจสอบว่าสามารถเช็ค/ตัด Stock ได้หรือไม่
   */
  canDeductStock(): boolean {
    return this.stockDeductionStatus?.canDeduct ?? true;
  }

  /**
   * ⭐ NEW: ตรวจสอบว่าสามารถคืน Stock ได้หรือไม่
   */
  canRestoreStock(): boolean {
    return this.stockDeductionStatus?.canRestore ?? false;
  }

  /**
   * ⭐ NEW: ตรวจสอบว่าตัด Stock ครบแล้วหรือไม่
   */
  isAllStockDeducted(): boolean {
    return this.stockDeductionStatus?.allCompleted ?? false;
  }

  /**
   * ⭐ NEW: แสดง Badge สถานะการตัด Stock
   */
  getStockDeductionBadgeText(): string {
    if (!this.stockDeductionStatus) return 'กำลังโหลด...';

    const { totalItems, completedCount, pendingCount, failedCount, allCompleted } = this.stockDeductionStatus;

    if (allCompleted) {
      return `✅ ตัด Stock ครบแล้ว (${completedCount}/${totalItems})`;
    } else if (completedCount > 0) {
      return `⏳ ตัดแล้วบางส่วน (${completedCount}/${totalItems})`;
    } else if (failedCount > 0) {
      return `❌ ตัดล้มเหลว (${failedCount}/${totalItems})`;
    } else {
      return `⏸️ รอตัด Stock`;
    }
  }

  /**
   * ⭐ NEW: CSS Class สำหรับ Badge สถานะ
   */
  getStockDeductionBadgeClass(): string {
    if (!this.stockDeductionStatus) return 'badge badge-gray';

    const { allCompleted, completedCount, failedCount } = this.stockDeductionStatus;

    if (allCompleted) {
      return 'badge badge-green';
    } else if (completedCount > 0) {
      return 'badge badge-warning';
    } else if (failedCount > 0) {
      return 'badge badge-red';
    } else {
      return 'badge badge-gray';
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  editOrder(): void {
    this.router.navigate(['/orders/edit', this.orderId]);
  }

  /**
   * ⭐ UPDATED: เช็ค Stock ด้วย Modal - ตรวจสอบสถานะก่อน
   */
  checkStock(): void {
    if (!this.orderId) return;

    // ⭐ ตรวจสอบว่าตัด Stock ครบแล้วหรือไม่
    if (this.isAllStockDeducted()) {
      alert('⚠️ Order นี้ตัด Stock ครบแล้ว\n\nหากต้องการตัดใหม่ กรุณาคืน Stock ก่อน');
      return;
    }

    this.orderService.checkStockDetails(this.orderId).subscribe({
      next: (response) => {
        // ⭐ เปิด Modal ขนาดใหญ่เกือบเต็มหน้าจอ
        const dialogRef = this.dialog.open(StockCheckModalComponent, {
          width: '95vw',
          maxWidth: '1400px',
          height: '90vh',
          maxHeight: '90vh',
          data: {
            orderNumber: response.orderNumber,
            allAvailable: response.allAvailable,
            details: response.details
          },
          disableClose: false,
          panelClass: 'stock-check-modal-panel'
        });

        dialogRef.afterClosed().subscribe((confirmed: any) => {
          if (confirmed) {
            this.performStockDeduction();
          }
        });
      },
      error: (error) => {
        console.error('Error checking stock:', error);
        alert('เกิดข้อผิดพลาดในการเช็ค Stock: ' + (error.error?.message || error.message));
      }
    });
  }

  /**
   * ⭐ UPDATED: ทำการตัด Stock หลังยืนยัน - Reload สถานะหลังตัดเสร็จ
   */
  private performStockDeduction(): void {
    if (!this.orderId) return;

    if (confirm('ยืนยันการตัด Stock สำหรับออเดอร์นี้?')) {
      this.orderService.deductStockForOrder(this.orderId).subscribe({
        next: (response) => {
          const messages = response.messages || [];
          const displayMessage = messages.slice(0, 10).join('\n') +
            (messages.length > 10 ? '\n... และอื่นๆ' : '');

          alert('✅ ตัด Stock เสร็จสิ้น!\n\n' + displayMessage);

          // ⭐ Reload ทั้ง Order และ Stock Status
          this.loadOrder();
          this.loadStockDeductionStatus();
        },
        error: (error) => {
          console.error('Error deducting stock:', error);
          alert('เกิดข้อผิดพลาดในการตัด Stock: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  /**
   * ⭐ NEW: คืน Stock ที่ตัดไปแล้ว
   */
  restoreStock(): void {
    if (!this.orderId) return;

    // ตรวจสอบว่าสามารถคืน Stock ได้หรือไม่
    if (!this.canRestoreStock()) {
      alert('⚠️ ไม่สามารถคืน Stock ได้\n\nเหตุผล: ยังไม่มีรายการที่ตัด Stock แล้ว');
      return;
    }

    // Confirmation dialog พร้อมคำเตือน
    const confirmMessage = `⚠️ ยืนยันการคืน Stock สำหรับ Order ${this.order?.orderNumber}?

การคืน Stock จะทำให้:
✓ Stock ที่ตัดไปจะถูกเพิ่มกลับเข้าคลัง
✓ สถานะการตัด Stock จะเปลี่ยนเป็น PENDING
✓ คุณสามารถตัด Stock ใหม่ได้อีกครั้ง

⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // เรียก API คืน Stock
    this.orderService.restoreStockForOrder(this.orderId).subscribe({
      next: (response) => {
        console.log('Stock restoration response:', response);

        const messages = response.messages || [];
        const displayMessage = messages.slice(0, 15).join('\n') +
          (messages.length > 15 ? '\n... และอื่นๆ' : '');

        alert('✅ คืน Stock เสร็จสิ้น!\n\n' + displayMessage);

        // ⭐ Reload ทั้ง Order และ Stock Status
        this.loadOrder();
        this.loadStockDeductionStatus();
      },
      error: (error) => {
        console.error('Error restoring stock:', error);
        alert('เกิดข้อผิดพลาดในการคืน Stock: ' + (error.error?.message || error.message));
      }
    });
  }

  updateStatus(newStatus: string): void {
    if (confirm(`ต้องการเปลี่ยนสถานะเป็น ${newStatus}?`)) {
      this.orderService.updateOrderStatus(this.orderId!, newStatus).subscribe({
        next: (updatedOrder) => {
          alert('เปลี่ยนสถานะสำเร็จ');
          this.order = updatedOrder;
          this.loadOrder();
        },
        error: (error) => {
          console.error('Error updating status:', error);
          const errorMessage = error.error?.message || error.message || 'เกิดข้อผิดพลาด';
          alert('ไม่สามารถเปลี่ยนสถานะได้: ' + errorMessage);
        }
      });
    }
  }

  updatePaymentStatus(newStatus: string): void {
    const previousStatus = this.order?.paymentStatus;

    if (confirm(`ต้องการเปลี่ยนสถานะการชำระเงินเป็น ${newStatus}?`)) {
      this.orderService.updatePaymentStatus(this.orderId!, newStatus).subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          alert('เปลี่ยนสถานะการชำระเงินสำเร็จ');

          if (newStatus === 'PAID' && previousStatus !== 'PAID') {
            setTimeout(() => {
              alert('✅ Transaction รายรับถูกสร้างอัตโนมัติแล้ว');
            }, 500);
          }

          this.loadOrder();
        },
        error: (error) => {
          console.error('Error updating payment status:', error);
          const errorMessage = error.error?.message || error.message || 'เกิดข้อผิดพลาด';
          alert('ไม่สามารถเปลี่ยนสถานะได้: ' + errorMessage);
        }
      });
    }
  }

  cancelOrder(): void {
    if (confirm('ต้องการยกเลิกออเดอร์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      this.orderService.cancelOrder(this.orderId!).subscribe({
        next: () => {
          alert('ยกเลิกออเดอร์สำเร็จ');
          this.loadOrder();
          this.loadStockDeductionStatus(); // ⭐ Reload สถานะ
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          alert('เกิดข้อผิดพลาด');
        }
      });
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'PENDING': return 'badge badge-warning';
      case 'CONFIRMED': return 'badge badge-info';
      case 'PROCESSING': return 'badge badge-primary';
      case 'PACKED': return 'badge badge-purple';
      case 'SHIPPED': return 'badge badge-blue';
      case 'DELIVERED': return 'badge badge-green';
      case 'CANCELLED': return 'badge badge-red';
      case 'RETURNED': return 'badge badge-orange';
      default: return 'badge badge-gray';
    }
  }

  getPaymentStatusClass(status: string | undefined): string {
    switch (status) {
      case 'PAID': return 'badge badge-green';
      case 'UNPAID': return 'badge badge-red';
      case 'REFUNDED': return 'badge badge-orange';
      default: return 'badge badge-gray';
    }
  }

  getStockDeductionClass(status: string | undefined): string {
    switch (status) {
      case 'PENDING': return 'badge badge-warning';
      case 'COMPLETED': return 'badge badge-green';
      case 'FAILED': return 'badge badge-red';
      case 'CANCELLED': return 'badge badge-gray';
      default: return 'badge badge-gray';
    }
  }

  formatCurrency(amount: number | undefined | null): string {
    const value = amount ?? 0;
    return `฿${value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSourceClass(source: string | undefined): string {
    switch (source) {
      case 'SHOP_24': return 'badge badge-blue';
      case 'SHOPEE': return 'badge badge-orange';
      case 'TIKTOK': return 'badge badge-tiktok';  // ⭐ เพิ่ม TikTok style
      case 'MANUAL': return 'badge badge-gray';
      default: return 'badge badge-gray';
    }
  }
}

export class OrderDetail {
}
