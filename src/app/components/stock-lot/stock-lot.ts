import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StockLotService, StockLot } from '../../services/stock-lot.service';

@Component({
  selector: 'app-stock-lot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-lot.html',
  styleUrls: ['./stock-lot.css']
})
export class StockLotComponent implements OnInit {
  // ⭐ เพิ่ม allStockLots เพื่อเก็บข้อมูลต้นฉบับ
  allStockLots: StockLot[] = [];
  filteredStockLots: StockLot[] = [];
  paginatedStockLots: StockLot[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  loading: boolean = false;
  selectedStatus: 'ALL' | 'PENDING' | 'IN_TRANSIT' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED' = 'ALL';
  isDropdownOpen: boolean = false;
  activeStockLot: StockLot | null = null;

  constructor(
    private stockLotService: StockLotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStockLots();
  }

  get totalStockLots(): number {
    return this.filteredStockLots.length;
  }

  loadStockLots(): void {
    this.loading = true;
    this.stockLotService.getAllStockLots().subscribe({
      next: (stockLots) => {
        // ⭐ เก็บข้อมูลต้นฉบับ
        this.allStockLots = stockLots;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stock lots:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * ⭐ แก้ไข applyFilters() ให้เริ่มจาก allStockLots
   */
  applyFilters(): void {
    // ⭐ เริ่มจากข้อมูลต้นฉบับทุกครั้ง
    let filtered = [...this.allStockLots];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(lot =>
        lot.lotName.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(lot => lot.status === this.selectedStatus);
    }

    this.filteredStockLots = filtered;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStockLots.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedStockLots = this.filteredStockLots.slice(startIndex, endIndex);
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  getRowNumber(index: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + index + 1;
  }

  viewStockLotDetails(stockLot: StockLot): void {
    this.router.navigate(['/stock-lots', stockLot.stockLotId]);
  }

  openAddStockLotModal(): void {
    this.router.navigate(['/stock-lots/add']);
  }

  editStockLot(stockLot: StockLot): void {
    this.router.navigate(['/stock-lots/edit', stockLot.stockLotId]);
    this.closeDropdown();
  }

  updateStockLotStatus(stockLot: StockLot, newStatus: string): void {
    if (stockLot.stockLotId) {
      this.stockLotService.updateStockLotStatus(stockLot.stockLotId, newStatus).subscribe({
        next: () => {
          this.loadStockLots();
          this.closeDropdown();
        },
        error: (error) => console.error('Error updating stock lot status:', error)
      });
    }
  }

  deleteStockLot(stockLot: StockLot): void {
    if (!stockLot.stockLotId) return;

    let confirmMessage = '';

    // ✅ ข้อความยืนยันพิเศษสำหรับ COMPLETED stock lot
    if (stockLot.status === 'COMPLETED') {
      confirmMessage =
        `⚠️ คำเตือน: Stock Lot นี้มีสถานะ COMPLETED!\n\n` +
        `Lot Name: ${stockLot.lotName}\n` +
        `Import Date: ${this.formatDate(stockLot.importDate)}\n` +
        `Status: ${stockLot.status}\n\n` +
        `⚠️ การลบ Stock Lot ที่ COMPLETED อาจส่งผลต่อ:\n` +
        `- Transaction ที่เชื่อมโยง\n` +
        `- รายงานทางการเงิน\n` +
        `- ข้อมูลสินค้าที่เกี่ยวข้อง\n\n` +
        `⛔ การกระทำนี้ไม่สามารถย้อนกลับได้\n\n` +
        `❓ คุณแน่ใจหรือไม่ที่จะลบ Stock Lot นี้?`;
    } else {
      // ข้อความยืนยันปกติ
      confirmMessage =
        `⚠️ ยืนยันการลบ Stock Lot\n\n` +
        `Lot Name: ${stockLot.lotName}\n` +
        `Import Date: ${this.formatDate(stockLot.importDate)}\n` +
        `Status: ${stockLot.status}\n\n` +
        `⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้`;
    }

    if (confirm(confirmMessage)) {
      // ✅ Double confirmation สำหรับ COMPLETED stock lot
      if (stockLot.status === 'COMPLETED') {
        const doubleConfirm = confirm(
          `🚨 ยืนยันอีกครั้ง!\n\n` +
          `คุณกำลังจะลบ Stock Lot ที่มีสถานะ COMPLETED\n` +
          `ซึ่งอาจส่งผลต่อความถูกต้องของข้อมูล\n\n` +
          `กดตกลงเพื่อยืนยันการลบ`
        );

        if (!doubleConfirm) {
          return;
        }
      }

      this.loading = true;

      if (stockLot.stockLotId) {
        this.stockLotService.deleteStockLot(stockLot.stockLotId).subscribe({
          next: () => {
            if (stockLot.status === 'COMPLETED') {
              alert('✅ ลบ Stock Lot (COMPLETED) สำเร็จ\n\n⚠️ กรุณาตรวจสอบข้อมูลที่เกี่ยวข้องให้ถูกต้อง');
            } else {
              alert('✅ ลบ Stock Lot สำเร็จ');
            }
            this.loadStockLots();
            this.closeDropdown();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error deleting stock lot:', error);
            const errorMessage = error.message || 'เกิดข้อผิดพลาดในการลบ Stock Lot';
            alert('❌ ' + errorMessage);
            this.loading = false;
          }
        });
      }
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'PENDING':
        return 'badge badge-yellow';
      case 'IN_TRANSIT':
        return 'badge badge-blue';
      case 'ARRIVED':
        return 'badge badge-green';
      case 'COMPLETED':
        return 'badge badge-green';
      case 'CANCELLED':
        return 'badge badge-red';
      default:
        return 'badge badge-gray';
    }
  }

  toggleDropdown(event: Event, stockLot: StockLot): void {
    event.stopPropagation();
    if (this.activeStockLot === stockLot) {
      this.closeDropdown();
    } else {
      this.activeStockLot = stockLot;
      this.isDropdownOpen = true;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.activeStockLot = null;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('th-TH');
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '฿0.000';
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(amount);
  }
}
