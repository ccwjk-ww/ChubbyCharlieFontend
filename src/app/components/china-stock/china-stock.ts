import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChinaStockService, ChinaStock, DefectiveRecord } from '../../services/china-stock.service';
import { StockLotService, StockLot } from '../../services/stock-lot.service';
import { ThaiStock } from '../../services/thai-stock.service';
import { StockDocumentWidgetComponent } from '../stock-document-widget/stock-document-widget';

@Component({
  selector: 'app-china-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, StockDocumentWidgetComponent],
  templateUrl: './china-stock.html',
  styleUrls: ['./china-stock.css']
})
export class ChinaStockComponent implements OnInit {
  allChinaStocks: ChinaStock[] = [];
  filteredChinaStocks: ChinaStock[] = [];
  paginatedChinaStocks: ChinaStock[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  loading: boolean = false;
  selectedStatus: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' = 'ALL';
  selectedLot: string = 'ALL';
  stockLots: StockLot[] = [];
  isDropdownOpen: boolean = false;
  activeChinaStock: ChinaStock | null = null;

  // ============================================
  // Defective — บันทึก
  // ============================================
  showDefectiveModal: boolean = false;
  defectiveModalStock: ChinaStock | null = null;
  defectiveCount: number = 1;
  defectiveNote: string = '';
  defectiveLoading: boolean = false;

  // ============================================
  // Defective — ดูประวัติ
  // ============================================
  showDefectiveHistoryModal: boolean = false;
  defectiveHistoryStock: ChinaStock | null = null;
  defectiveHistory: DefectiveRecord[] = [];
  historyLoading: boolean = false;

  // เพิ่ม state
  showDocModal = false;
  docModalStock: ChinaStock | null = null;

  openDocModal(stock: ChinaStock): void {
    this.docModalStock = stock;
    this.showDocModal = true;
    this.closeDropdown();
  }

  closeDocModal(): void {
    this.showDocModal = false;
    this.docModalStock = null;
  }
  constructor(
    public chinaStockService: ChinaStockService,
    private stockLotService: StockLotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStockLots();
    this.loadChinaStocks();
  }

  get totalChinaStocks(): number { return this.filteredChinaStocks.length; }

  loadStockLots(): void {
    this.stockLotService.getAllStockLots().subscribe({
      next: (lots) => { this.stockLots = lots; },
      error: (e) => console.error('Error loading stock lots:', e)
    });
  }

  loadChinaStocks(): void {
    this.loading = true;
    this.chinaStockService.getAllChinaStocks().subscribe({
      next: (stocks) => { this.allChinaStocks = stocks; this.applyFilters(); this.loading = false; },
      error: (e) => { console.error('Error loading China stocks:', e); this.loading = false; }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    if (this.searchTerm.trim()) {
      this.chinaStockService.searchChinaStocks(this.searchTerm).subscribe({
        next: (stocks) => { this.allChinaStocks = stocks; this.applyFilters(); },
        error: (e) => console.error('Error searching:', e)
      });
    } else { this.loadChinaStocks(); }
  }

  onFilterChange(): void { this.currentPage = 1; this.applyFilters(); }

  applyFilters(): void {
    let filtered = [...this.allChinaStocks];
    if (this.selectedStatus !== 'ALL') filtered = filtered.filter(s => s.status === this.selectedStatus);
    if (this.selectedLot !== 'ALL') {
      const id = Number(this.selectedLot);
      filtered = filtered.filter(s => (s.stockLotId || s.stockLot?.stockLotId) === id);
    }
    this.filteredChinaStocks = filtered;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredChinaStocks.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) this.currentPage = this.totalPages;
  }

  updatePaginatedData(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedChinaStocks = this.filteredChinaStocks.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page; this.updatePaginatedData();
    }
  }

  getRowNumber(index: number): number { return (this.currentPage - 1) * this.itemsPerPage + index + 1; }

  openAddChinaStockModal(): void { this.router.navigate(['/china-stocks/add']); }
  editChinaStock(stock: ChinaStock): void { this.router.navigate(['/china-stocks/edit', stock.stockItemId]); this.closeDropdown(); }

  updateChinaStockStatus(stock: ChinaStock, newStatus: string): void {
    if (stock.stockItemId) {
      this.chinaStockService.updateChinaStockStatus(stock.stockItemId, newStatus).subscribe({
        next: () => { this.loadChinaStocks(); this.closeDropdown(); },
        error: (e) => console.error('Error updating status:', e)
      });
    }
  }

  deleteChinaStock(stock: ChinaStock): void {
    if (confirm(`Are you sure you want to delete ${stock.name}?`) && stock.stockItemId) {
      this.chinaStockService.deleteChinaStock(stock.stockItemId).subscribe({
        next: () => { this.loadChinaStocks(); this.closeDropdown(); },
        error: (e) => console.error('Error deleting:', e)
      });
    }
  }

  // ============================================
  // Defective Modal — บันทึก
  // ============================================

  openDefectiveModal(stock: ChinaStock): void {
    this.defectiveModalStock = stock;
    this.defectiveCount = 1;
    this.defectiveNote = '';
    this.showDefectiveModal = true;
    this.closeDropdown();
  }

  closeDefectiveModal(): void {
    this.showDefectiveModal = false;
    this.defectiveModalStock = null;
    this.defectiveCount = 1;
    this.defectiveNote = '';
  }

  confirmDefective(): void {
    if (!this.defectiveModalStock?.stockItemId || this.defectiveCount <= 0) return;
    const currentQty = this.defectiveModalStock.currentQuantity || this.defectiveModalStock.quantity || 0;
    if (this.defectiveCount > currentQty) {
      alert(`❌ ของเสียเกินจำนวนคงเหลือ (คงเหลือ: ${currentQty} ชิ้น)`);
      return;
    }
    this.defectiveLoading = true;
    this.chinaStockService.recordDefective(
      this.defectiveModalStock.stockItemId,
      this.defectiveCount,
      this.defectiveNote || undefined
    ).subscribe({
      next: (updated) => {
        const idx = this.allChinaStocks.findIndex(s => s.stockItemId === updated.stockItemId);
        if (idx !== -1) this.allChinaStocks[idx] = updated;
        this.applyFilters();
        this.defectiveLoading = false;
        this.closeDefectiveModal();
      },
      error: (e) => {
        const msg = e?.error?.message || 'เกิดข้อผิดพลาดในการบันทึกของเสีย';
        alert(`❌ ${msg}`);
        this.defectiveLoading = false;
      }
    });
  }

  // ============================================
  // Defective History Modal — ดูประวัติ
  // ============================================

  openDefectiveHistoryModal(stock: ChinaStock): void {
    this.defectiveHistoryStock = stock;
    this.defectiveHistory = [];
    this.showDefectiveHistoryModal = true;
    this.historyLoading = true;
    this.closeDropdown();
    if (stock.stockItemId) {
      this.chinaStockService.getDefectiveRecords(stock.stockItemId).subscribe({
        next: (records) => { this.defectiveHistory = records; this.historyLoading = false; },
        error: (e) => { console.error('Error loading defective records:', e); this.historyLoading = false; }
      });
    }
  }

  closeDefectiveHistoryModal(): void {
    this.showDefectiveHistoryModal = false;
    this.defectiveHistoryStock = null;
    this.defectiveHistory = [];
  }

  // ============================================
  // Quantity breakdown helpers
  // ============================================

  /** จำนวนที่ "ใช้ขาย" = originalQty - currentQty - defectiveQty */
  getSoldQuantity(stock: ChinaStock): number {
    const original = stock.originalQuantity || 0;
    const current  = stock.currentQuantity || stock.quantity || 0;
    const defective = stock.defectiveQuantity || 0;
    const sold = original - current - defective;
    return Math.max(0, sold);
  }

  /** % ของเสีย เทียบกับ original */
  getDefectivePercentage(stock: ChinaStock): number {
    const original = stock.originalQuantity || 0;
    if (original <= 0) return 0;
    return Math.round(((stock.defectiveQuantity || 0) / original) * 100);
  }

  /** % ที่ใช้ขายไป เทียบกับ original */
  getSoldPercentage(stock: ChinaStock): number {
    const original = stock.originalQuantity || 0;
    if (original <= 0) return 0;
    return Math.round((this.getSoldQuantity(stock) / original) * 100);
  }

  /** % คงเหลือจริง (หลังหักของเสีย) */
  getTrueRemainingPercentage(stock: ChinaStock): number {
    const original = stock.originalQuantity || 0;
    if (original <= 0) return 0;
    const current = stock.currentQuantity || stock.quantity || 0;
    return Math.round((current / original) * 100);
  }

  hasDefective(stock: ChinaStock): boolean {
    return (stock.defectiveQuantity ?? 0) > 0;
  }

  getDefectiveValue(stock: ChinaStock): number {
    return stock.defectiveValue ?? 0;
  }

  getDefectiveUnitPrice(stock: ChinaStock): number {
    const base = stock.finalPricePerPair || 0;
    if (stock.includeVat && stock.vatPercentage && stock.vatPercentage > 0) {
      return base * (1 + stock.vatPercentage / 100);
    }
    return base;
  }

  getDefectivePreviewValue(stock: ChinaStock, count: number): number {
    return this.getDefectiveUnitPrice(stock) * count;
  }

  getDefectiveTotalPreview(stock: ChinaStock, count: number): number {
    return this.getDefectiveValue(stock) + this.getDefectivePreviewValue(stock, count);
  }

  // ============================================
  // VAT helpers
  // ============================================

  calculateVatAmount(stock: ChinaStock): number {
    const totalBath = stock.totalBath || 0;
    if (stock.includeVat && stock.vatPercentage && stock.vatPercentage > 0) {
      return totalBath * (stock.vatPercentage / 100);
    }
    return 0;
  }

  calculateTotalWithVat(stock: ChinaStock): number {
    return (stock.totalBath || 0) + this.calculateVatAmount(stock);
  }

  calculateFinalPriceWithVat(stock: ChinaStock): number {
    const qty = stock.currentQuantity || stock.quantity || 0;
    if (qty <= 0) return 0;
    return this.calculateTotalWithVat(stock) / qty;
  }

  hasVat(stock: ChinaStock): boolean {
    return !!(stock.includeVat && stock.vatPercentage && stock.vatPercentage > 0);
  }

  // ============================================
  // Format
  // ============================================

  formatCurrency(amount: number | undefined, currency: string = 'THB'): string {
    if (!amount) return currency === 'THB' ? '฿0.00' : '¥0.00';
    if (currency === 'THB') {
      return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(amount);
    }
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 2 }).format(amount);
  }

  formatDateTime(isoStr: string): string {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getLotName(stock: ChinaStock | ThaiStock): string {
    if (stock.stockLot?.lotName) return stock.stockLot.lotName;
    if (stock.stockLotId) {
      const lot = this.stockLots.find(l => l.stockLotId === stock.stockLotId);
      return lot?.lotName || `Lot ID: ${stock.stockLotId}`;
    }
    return 'No Lot';
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'ACTIVE': return 'badge badge-green';
      case 'INACTIVE': return 'badge badge-red';
      case 'OUT_OF_STOCK': return 'badge badge-yellow';
      default: return 'badge badge-gray';
    }
  }

  toggleDropdown(event: Event, stock: ChinaStock): void {
    event.stopPropagation();
    if (this.activeChinaStock === stock) { this.closeDropdown(); }
    else { this.activeChinaStock = stock; this.isDropdownOpen = true; }
  }

  closeDropdown(): void { this.isDropdownOpen = false; this.activeChinaStock = null; }
}
