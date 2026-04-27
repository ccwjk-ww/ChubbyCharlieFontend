import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThaiStockService, ThaiStock } from '../../services/thai-stock.service';
import { StockLotService, StockLot } from '../../services/stock-lot.service';
import { ChinaStock } from '../../services/china-stock.service';
import { StockDocumentWidgetComponent } from '../stock-document-widget/stock-document-widget';
@Component({
  selector: 'app-thai-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, StockDocumentWidgetComponent],
  templateUrl: './thai-stock.html',
  styleUrls: ['./thai-stock.css']
})
export class ThaiStockComponent implements OnInit {
  allThaiStocks: ThaiStock[] = [];
  filteredThaiStocks: ThaiStock[] = [];
  paginatedThaiStocks: ThaiStock[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  loading: boolean = false;
  selectedStatus: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' = 'ALL';
  selectedLot: string = 'ALL';
  stockLots: StockLot[] = [];
  isDropdownOpen: boolean = false;
  activeThaiStock: ThaiStock | null = null;

  showDefectiveModal: boolean = false;
  defectiveModalStock: ThaiStock | null = null;
  defectiveCount: number = 1;
  defectiveLoading: boolean = false;

  showDocModal = false;
  docModalStock: ThaiStock | null = null;

  openDocModal(stock: ThaiStock): void {
    this.docModalStock = stock;
    this.showDocModal = true;
    this.closeDropdown();
  }

  closeDocModal(): void {
    this.showDocModal = false;
    this.docModalStock = null;
  }

  constructor(
    public thaiStockService: ThaiStockService,
    private stockLotService: StockLotService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadStockLots(); this.loadThaiStocks(); }

  get totalThaiStocks(): number { return this.filteredThaiStocks.length; }

  loadStockLots(): void {
    this.stockLotService.getAllStockLots().subscribe({
      next: (lots) => { this.stockLots = lots; },
      error: (e) => console.error('Error loading stock lots:', e)
    });
  }

  loadThaiStocks(): void {
    this.loading = true;
    this.thaiStockService.getAllThaiStocks().subscribe({
      next: (stocks) => { this.allThaiStocks = stocks; this.applyFilters(); this.loading = false; },
      error: (e) => { console.error('Error loading Thai stocks:', e); this.loading = false; }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    if (this.searchTerm.trim()) {
      this.thaiStockService.searchThaiStocks(this.searchTerm).subscribe({
        next: (stocks) => { this.allThaiStocks = stocks; this.applyFilters(); },
        error: (e) => console.error('Error searching:', e)
      });
    } else { this.loadThaiStocks(); }
  }

  onFilterChange(): void { this.currentPage = 1; this.applyFilters(); }

  applyFilters(): void {
    let filtered = [...this.allThaiStocks];
    if (this.selectedStatus !== 'ALL') filtered = filtered.filter(s => s.status === this.selectedStatus);
    if (this.selectedLot !== 'ALL') {
      const id = Number(this.selectedLot);
      filtered = filtered.filter(s => (s.stockLotId || s.stockLot?.stockLotId) === id);
    }
    this.filteredThaiStocks = filtered;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredThaiStocks.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) this.currentPage = this.totalPages;
  }

  updatePaginatedData(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedThaiStocks = this.filteredThaiStocks.slice(start, start + this.itemsPerPage);
  }

  onItemsPerPageChange(): void { this.currentPage = 1; this.calculatePagination(); this.updatePaginatedData(); }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page; this.updatePaginatedData();
    }
  }

  getRowNumber(index: number): number { return (this.currentPage - 1) * this.itemsPerPage + index + 1; }

  openAddThaiStockModal(): void { this.router.navigate(['/thai-stocks/add']); }

  editThaiStock(stock: ThaiStock): void { this.router.navigate(['/thai-stocks/edit', stock.stockItemId]); this.closeDropdown(); }

  updateThaiStockStatus(stock: ThaiStock, newStatus: string): void {
    if (stock.stockItemId) {
      this.thaiStockService.updateThaiStockStatus(stock.stockItemId, newStatus).subscribe({
        next: () => { this.loadThaiStocks(); this.closeDropdown(); },
        error: (e) => console.error('Error updating status:', e)
      });
    }
  }

  deleteThaiStock(stock: ThaiStock): void {
    if (confirm(`Are you sure you want to delete ${stock.name}?`) && stock.stockItemId) {
      this.thaiStockService.deleteThaiStock(stock.stockItemId).subscribe({
        next: () => { this.loadThaiStocks(); this.closeDropdown(); },
        error: (e) => console.error('Error deleting:', e)
      });
    }
  }

  // ============================================
  // Defective Modal
  // ============================================

  openDefectiveModal(stock: ThaiStock): void {
    this.defectiveModalStock = stock;
    this.defectiveCount = 1;
    this.showDefectiveModal = true;
    this.closeDropdown();
  }

  closeDefectiveModal(): void {
    this.showDefectiveModal = false;
    this.defectiveModalStock = null;
    this.defectiveCount = 1;
  }

  confirmDefective(): void {
    if (!this.defectiveModalStock?.stockItemId || this.defectiveCount <= 0) return;
    this.defectiveLoading = true;
    this.thaiStockService.recordDefective(this.defectiveModalStock.stockItemId, this.defectiveCount).subscribe({
      next: (updated) => {
        const idx = this.allThaiStocks.findIndex(s => s.stockItemId === updated.stockItemId);
        if (idx !== -1) this.allThaiStocks[idx] = updated;
        this.applyFilters();
        this.defectiveLoading = false;
        this.closeDefectiveModal();
      },
      error: (e) => { console.error('Error recording defective:', e); alert('❌ เกิดข้อผิดพลาดในการบันทึกของเสีย'); this.defectiveLoading = false; }
    });
  }

  // ============================================
  // ⭐ Defective Display Methods
  // ============================================

  hasDefective(stock: ThaiStock): boolean {
    return (stock.defectiveQuantity ?? 0) > 0;
  }

  getDefectiveValue(stock: ThaiStock): number {
    return stock.defectiveValue ?? 0;
  }

  /**
   * ⭐ ราคาต้นทุน/หน่วย ที่ใช้คำนวณของเสีย
   * - มี VAT → ใช้ราคารวม VAT (pricePerUnitWithShipping × (1 + vatPct/100))
   * - ไม่มี VAT → ใช้ pricePerUnitWithShipping ปกติ
   */
  getDefectiveUnitPrice(stock: ThaiStock): number {
    const base = stock.pricePerUnitWithShipping || 0;
    if (stock.includeVat && stock.vatPercentage && stock.vatPercentage > 0) {
      return base * (1 + stock.vatPercentage / 100);
    }
    return base;
  }

  /**
   * ⭐ Preview มูลค่าของเสียครั้งนี้ (ใช้ใน Modal)
   */
  getDefectivePreviewValue(stock: ThaiStock, count: number): number {
    return this.getDefectiveUnitPrice(stock) * count;
  }

  /**
   * ⭐ มูลค่าของเสียสะสมหลังบันทึกครั้งนี้ (ใช้ใน Modal)
   */
  getDefectiveTotalPreview(stock: ThaiStock, count: number): number {
    return this.getDefectiveValue(stock) + this.getDefectivePreviewValue(stock, count);
  }

  /**
   * ⭐ % ของเสียเทียบกับ originalQuantity
   */
  getDefectivePercentage(stock: ThaiStock): number {
    const original = stock.originalQuantity || stock.currentQuantity || stock.quantity || 0;
    if (original <= 0) return 0;
    const defective = stock.defectiveQuantity ?? 0;
    return Math.round((defective / original) * 100);
  }

  // ============================================
  // VAT & cost calculation methods
  // ============================================

  calculateTotalCost(stock: ThaiStock): number {
    return (stock.priceTotal || 0) + (stock.shippingCost || 0);
  }

  calculateVatAmount(stock: ThaiStock): number {
    const total = this.calculateTotalCost(stock);
    if (stock.includeVat && stock.vatPercentage && stock.vatPercentage > 0) {
      return total * (stock.vatPercentage / 100);
    }
    return 0;
  }

  calculateGrandTotal(stock: ThaiStock): number {
    return this.calculateTotalCost(stock) + this.calculateVatAmount(stock);
  }

  calculateFinalPriceWithVat(stock: ThaiStock): number {
    const qty = stock.currentQuantity || stock.quantity || 0;
    if (qty <= 0) return 0;
    return this.calculateGrandTotal(stock) / qty;
  }

  hasVat(stock: ThaiStock): boolean {
    return !!(stock.includeVat && stock.vatPercentage && stock.vatPercentage > 0);
  }

  // ============================================
  // Format methods
  // ============================================

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '฿0.00';
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
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

  toggleDropdown(event: Event, stock: ThaiStock): void {
    event.stopPropagation();
    if (this.activeThaiStock === stock) { this.closeDropdown(); }
    else { this.activeThaiStock = stock; this.isDropdownOpen = true; }
  }

  closeDropdown(): void { this.isDropdownOpen = false; this.activeThaiStock = null; }
}
