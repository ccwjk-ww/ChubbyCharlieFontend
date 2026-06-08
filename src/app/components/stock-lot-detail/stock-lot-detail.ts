import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StockLotService, StockLot } from '../../services/stock-lot.service';

@Component({
  selector: 'app-stock-lot-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stock-lot-detail.html',
  styleUrls: ['./stock-lot-detail.css']
})
export class StockLotDetailComponent implements OnInit {
  stockLot: StockLot | null = null;
  stockLotId: number | null = null;
  loading: boolean = true;

  totalCostBeforeVat: number = 0;
  totalVatAmount: number = 0;
  totalCostWithVat: number = 0;

  get totalCost(): number {
    return this.totalCostWithVat;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockLotService: StockLotService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.stockLotId = Number(id);
      this.loadStockLot();
    }
  }

  loadStockLot(): void {
    if (!this.stockLotId) return;
    this.loading = true;
    this.stockLotService.getStockLotById(this.stockLotId).subscribe({
      next: (data) => {
        this.stockLot = data;
        this.calculateTotalCost();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stock lot:', error);
        this.loading = false;
        alert('ไม่สามารถโหลดข้อมูล Stock Lot ได้');
      }
    });
  }

  calculateTotalCost(): void {
    if (!this.stockLot?.items || this.stockLot.items.length === 0) {
      this.totalCostBeforeVat = 0;
      this.totalVatAmount = 0;
      this.totalCostWithVat = 0;
      return;
    }

    let beforeVatSum = 0;
    let vatSum = 0;

    this.stockLot.items.forEach((item) => {
      const beforeVat = this.getItemAmountBeforeVat(item);
      const vat = this.getItemVatAmount(item);
      beforeVatSum += beforeVat;
      vatSum += vat;
    });

    this.totalCostBeforeVat = beforeVatSum;
    this.totalVatAmount = vatSum;
    this.totalCostWithVat = beforeVatSum + vatSum;
  }

  // // ============================================
  // // ⭐ CORE: ยอดก่อน VAT ของ item
  // //    ใช้ field ที่ backend ส่งมา (totalValueBeforeVat หรือ totalValue)
  // // ============================================
  // private getItemAmountBeforeVat(item: any): number {
  //   // ⭐ ใช้ field ใหม่ที่ backend ส่งมา (หลังแก้ StockMapper)
  //   if (item.totalValueBeforeVat != null) return Number(item.totalValueBeforeVat);
  //   if (item.totalBath != null) return Number(item.totalBath);
  //   if (item.totalValue != null) return Number(item.totalValue);
  //
  //   // ThaiStock fallback
  //   if (item.priceTotal != null) {
  //     return Number(item.priceTotal) + Number(item.shippingCost || 0);
  //   }
  //
  //   // quantity × unitPrice fallback
  //   const qty = Number(item.quantity || item.currentQuantity || 0);
  //   const unitPrice = this.getItemUnitPrice(item);
  //   if (qty > 0 && unitPrice > 0) return qty * unitPrice;
  //
  //   return 0;
  // }

// ⭐ แก้ getItemAmountBeforeVat — ใช้ totalCostAtImport ที่ backend lock ไว้
  private getItemAmountBeforeVat(item: any): number {
    // ⭐ ใช้ totalValueBeforeVat ที่ backend คำนวณถูกต้องแล้ว
    if (item.totalValueBeforeVat != null && Number(item.totalValueBeforeVat) > 0) {
      return Number(item.totalValueBeforeVat);
    }
    // ⭐ fallback: totalBath (สำหรับ ChinaStock)
    if (item.totalBath != null && Number(item.totalBath) > 0) {
      return Number(item.totalBath);
    }
    // ⭐ fallback: totalValue
    if (item.totalValue != null && Number(item.totalValue) > 0) {
      return Number(item.totalValue);
    }
    return 0;
  }
  // ============================================
  // ⭐ CORE: VAT amount ของ item
  //    ใช้ vatAmount ที่ backend คำนวณมาให้แล้ว
  //    ถ้าไม่มีให้คำนวณเอง
  // ============================================
  private getItemVatAmount(item: any): number {
    // ⭐ ใช้ field ที่ backend คำนวณมาให้
    if (item.vatAmount != null) return Number(item.vatAmount);

    // คำนวณเองถ้า backend ยังไม่ได้ส่ง vatAmount มา
    const includeVat = item.includeVat ?? item.include_vat ?? false;
    const vatPct = Number(item.vatPercentage ?? item.vat_percentage ?? 0);
    if (includeVat && vatPct > 0) {
      const base = this.getItemAmountBeforeVat(item);
      return base * (vatPct / 100);
    }
    return 0;
  }

  // ============================================
  // Public methods สำหรับ template
  // ============================================

  /**
   * ยอดรวมของ item รวม VAT
   * ⭐ ใช้ totalValueWithVat จาก backend ก่อน แล้ว fallback คำนวณเอง
   */
  getItemTotalCost(item: any): number {
    if (item.totalValueWithVat != null) return Number(item.totalValueWithVat);
    return this.getItemAmountBeforeVat(item) + this.getItemVatAmount(item);
  }

  /**
   * VAT amount สำหรับแสดงใน row
   */
  getItemVatDisplay(item: any): number {
    return this.getItemVatAmount(item);
  }

  /**
   * ยอดก่อน VAT สำหรับแสดงใน row
   */
  getItemAmountBeforeVatDisplay(item: any): number {
    return this.getItemAmountBeforeVat(item);
  }

  /**
   * ตรวจสอบว่า item มี VAT
   */
  itemHasVat(item: any): boolean {
    // ⭐ ตรวจจาก vatAmount ที่ backend คำนวณมา
    if (item.vatAmount != null) return Number(item.vatAmount) > 0;

    // fallback ตรวจจาก field
    const includeVat = item.includeVat ?? item.include_vat ?? false;
    const vatPct = Number(item.vatPercentage ?? item.vat_percentage ?? 0);
    return !!(includeVat && vatPct > 0);
  }

  get lotHasAnyVat(): boolean {
    return this.totalVatAmount > 0;
  }

  // getItemUnitPrice(item: any): number {
  //   if (item.finalPricePerPair != null) return Number(item.finalPricePerPair);
  //   if (item.finalPrice != null) return Number(item.finalPrice);
  //   if (item.costPerUnit != null) return Number(item.costPerUnit);
  //   if (item.pricePerUnit != null) return Number(item.pricePerUnit);
  //   if (item.pricePerUnitWithShipping != null) return Number(item.pricePerUnitWithShipping);
  //   return 0;
  // }
// ⭐ แก้ getItemUnitPrice — ใช้ finalPrice (= unitCostAtImport) จาก backend
  getItemUnitPrice(item: any): number {
    // ⭐ finalPrice และ finalPricePerPair ใน DTO = unitCostAtImport ที่ lock ไว้แล้ว
    if (item.finalPrice != null && Number(item.finalPrice) > 0) {
      return Number(item.finalPrice);
    }
    if (item.finalPricePerPair != null && Number(item.finalPricePerPair) > 0) {
      return Number(item.finalPricePerPair);
    }
    return 0;
  }
  getItemUnitPriceWithVat(item: any): number {
    if (item.finalPriceWithVat != null) return Number(item.finalPriceWithVat);
    const total = this.getItemTotalCost(item);
    const qty = Number(item.quantity || item.currentQuantity || 1);
    return qty > 0 ? total / qty : 0;
  }

  // ============================================
  // Actions
  // ============================================

  completeStockLot(): void {
    if (!this.stockLotId || !this.stockLot) return;
    if (!this.stockLot.items || this.stockLot.items.length === 0) {
      alert('❌ ไม่สามารถ Complete ได้\n\nกรุณาเพิ่มสินค้าเข้า Stock Lot ก่อน');
      return;
    }
    if (this.stockLot.status === 'COMPLETED') {
      alert('❌ Stock Lot นี้ถูก Complete ไปแล้ว');
      return;
    }
    if (this.totalCostWithVat <= 0) {
      alert('❌ ไม่สามารถ Complete ได้\n\nยอดรวมเป็น 0\nกรุณาตรวจสอบข้อมูลสินค้าให้มีราคาครบถ้วน');
      return;
    }
    const vatLine = this.lotHasAnyVat ? `VAT รวม: ${this.formatCurrency(this.totalVatAmount)}\n` : '';
    const confirmed = confirm(
      `🎯 Complete Stock Lot?\n\n` +
      `Lot: ${this.stockLot.lotName}\n` +
      `จำนวนสินค้า: ${this.stockLot.items.length} รายการ\n` +
      `ยอดก่อน VAT: ${this.formatCurrency(this.totalCostBeforeVat)}\n` +
      vatLine +
      `ยอดรวมสุทธิ: ${this.formatCurrency(this.totalCostWithVat)}\n\n` +
      `✅ ระบบจะเปลี่ยนสถานะเป็น COMPLETED และสร้าง Transaction รายจ่ายอัตโนมัติ\n\nต้องการดำเนินการต่อหรือไม่?`
    );
    if (!confirmed) return;
    this.stockLotService.completeStockLot(this.stockLotId).subscribe({
      next: (response) => {
        alert(`✅ Complete Stock Lot สำเร็จ!\n\n📊 Transaction:\n- จำนวนเงิน: ${this.formatCurrency(response.totalCost)}\n- สินค้า: ${response.itemsCount} รายการ\n\nสถานะ: COMPLETED ✅`);
        this.loadStockLot();
      },
      error: (error) => {
        alert(`❌ ไม่สามารถ Complete ได้\n\n${error.error?.message || 'เกิดข้อผิดพลาด'}`);
      }
    });
  }

  editStockLot(): void {
    if (this.stockLot?.status === 'COMPLETED') { alert('❌ ไม่สามารถแก้ไข Stock Lot ที่ Complete แล้ว'); return; }
    this.router.navigate(['/stock-lots/edit', this.stockLotId]);
  }

  addChinaStock(): void {
    if (this.stockLot?.status === 'COMPLETED') { alert('❌ ไม่สามารถเพิ่มสินค้าใน Stock Lot ที่ Complete แล้ว'); return; }
    this.router.navigate(['/china-stocks/add'], { queryParams: { stockLotId: this.stockLotId } });
  }

  addThaiStock(): void {
    if (this.stockLot?.status === 'COMPLETED') { alert('❌ ไม่สามารถเพิ่มสินค้าใน Stock Lot ที่ Complete แล้ว'); return; }
    this.router.navigate(['/thai-stocks/add'], { queryParams: { stockLotId: this.stockLotId } });
  }

  updateStatus(status: string): void {
    if (!this.stockLotId) return;
    if (this.stockLot?.status === 'COMPLETED') { alert('❌ ไม่สามารถเปลี่ยนสถานะของ Stock Lot ที่ Complete แล้ว'); return; }
    this.stockLotService.updateStockLotStatus(this.stockLotId, status).subscribe({
      next: () => { alert(`✅ เปลี่ยนสถานะเป็น ${status} สำเร็จ`); this.loadStockLot(); },
      error: () => alert('❌ ไม่สามารถเปลี่ยนสถานะได้')
    });
  }

  deleteStockLot(): void {
    if (!this.stockLotId || !this.stockLot) return;
    if (this.stockLot.status === 'COMPLETED') { alert('❌ ไม่สามารถลบ Stock Lot ที่ Complete แล้ว'); return; }
    if (!confirm(`⚠️ ยืนยันการลบ?\n\nLot: ${this.stockLot.lotName}\nไม่สามารถย้อนกลับได้`)) return;
    this.stockLotService.deleteStockLot(this.stockLotId).subscribe({
      next: () => { alert('✅ ลบ Stock Lot สำเร็จ'); this.router.navigate(['/stock-lots']); },
      error: (error) => alert(`❌ ไม่สามารถลบได้\n\n${error.error?.message || 'เกิดข้อผิดพลาด'}`)
    });
  }

  goBack(): void { this.router.navigate(['/stock-lots']); }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '฿0.00';
    return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'ไม่ระบุ';
    return new Date(dateString).toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getStatusBadgeClass(): string {
    switch (this.stockLot?.status) {
      case 'PENDING': return 'badge-warning';
      case 'ARRIVED': return 'badge-info';
      case 'COMPLETED': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getStatusLabel(): string {
    switch (this.stockLot?.status) {
      case 'PENDING': return 'รอดำเนินการ';
      case 'ARRIVED': return 'สินค้าถึงแล้ว';
      case 'COMPLETED': return 'เสร็จสมบูรณ์';
      case 'CANCELLED': return 'ยกเลิก';
      default: return 'ไม่ทราบสถานะ';
    }
  }
}
