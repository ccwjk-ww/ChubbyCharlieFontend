import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChinaStockService, ChinaStock } from '../../services/china-stock.service';
import { StockLotService, StockLot } from '../../services/stock-lot.service';
import {ThaiStock} from '../../services/thai-stock.service';

@Component({
  selector: 'app-china-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './china-stock.html',
  styleUrls: ['./china-stock.css']
})
export class ChinaStockComponent implements OnInit {
  // ⭐ เก็บ stocks ต้นฉบับแยกจาก filtered
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

  constructor(
    private chinaStockService: ChinaStockService,
    private stockLotService: StockLotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStockLots();
    this.loadChinaStocks();
  }

  get totalChinaStocks(): number {
    return this.filteredChinaStocks.length;
  }

  loadStockLots(): void {
    this.stockLotService.getAllStockLots().subscribe({
      next: (lots) => {
        this.stockLots = lots;
      },
      error: (error) => console.error('Error loading stock lots:', error)
    });
  }

  loadChinaStocks(): void {
    this.loading = true;
    this.chinaStockService.getAllChinaStocks().subscribe({
      next: (stocks) => {
        // ⭐ เก็บข้อมูลต้นฉบับ
        this.allChinaStocks = stocks;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading China stocks:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    if (this.searchTerm.trim()) {
      this.chinaStockService.searchChinaStocks(this.searchTerm).subscribe({
        next: (stocks) => {
          this.allChinaStocks = stocks;
          this.applyFilters();
        },
        error: (error) => console.error('Error searching China stocks:', error)
      });
    } else {
      this.loadChinaStocks();
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * ⭐ แก้ไข applyFilters() ให้ Filter ถูกต้อง
   */
  applyFilters(): void {
    // เริ่มจาก stocks ต้นฉบับ
    let filtered = [...this.allChinaStocks];

    // ⭐ Filter by Status
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(stock => stock.status === this.selectedStatus);
    }

    // ⭐ Filter by Lot (แก้ไขให้ถูกต้อง)
    if (this.selectedLot !== 'ALL') {
      const selectedLotId = Number(this.selectedLot);
      filtered = filtered.filter(stock => {
        // รองรับทั้ง stockLotId และ stockLot.stockLotId
        const stockLotId = stock.stockLotId || stock.stockLot?.stockLotId;
        return stockLotId === selectedLotId;
      });
    }

    this.filteredChinaStocks = filtered;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredChinaStocks.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedChinaStocks = this.filteredChinaStocks.slice(startIndex, endIndex);
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

  openAddChinaStockModal(): void {
    this.router.navigate(['/china-stocks/add']);
  }

  editChinaStock(stock: ChinaStock): void {
    this.router.navigate(['/china-stocks/edit', stock.stockItemId]);
    this.closeDropdown();
  }

  updateChinaStockStatus(stock: ChinaStock, newStatus: string): void {
    if (stock.stockItemId) {
      this.chinaStockService.updateChinaStockStatus(stock.stockItemId, newStatus).subscribe({
        next: () => {
          this.loadChinaStocks();
          this.closeDropdown();
        },
        error: (error) => console.error('Error updating China stock status:', error)
      });
    }
  }

  deleteChinaStock(stock: ChinaStock): void {
    if (confirm(`Are you sure you want to delete ${stock.name}?`)) {
      if (stock.stockItemId) {
        this.chinaStockService.deleteChinaStock(stock.stockItemId).subscribe({
          next: () => {
            this.loadChinaStocks();
            this.closeDropdown();
          },
          error: (error) => console.error('Error deleting China stock:', error)
        });
      }
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'ACTIVE':
        return 'badge badge-green';
      case 'INACTIVE':
        return 'badge badge-red';
      case 'OUT_OF_STOCK':
        return 'badge badge-yellow';
      default:
        return 'badge badge-gray';
    }
  }

  toggleDropdown(event: Event, stock: ChinaStock): void {
    event.stopPropagation();
    if (this.activeChinaStock === stock) {
      this.closeDropdown();
    } else {
      this.activeChinaStock = stock;
      this.isDropdownOpen = true;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.activeChinaStock = null;
  }

  formatCurrency(amount: number | undefined, currency: string = 'THB'): string {
    if (!amount) return currency === 'THB' ? '฿0.000' : '¥0.000';

    if (currency === 'THB') {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      }).format(amount);
    } else {
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
      }).format(amount);
    }
  }

  getLotName(stock: ChinaStock | ThaiStock): string {
    if (stock.stockLot?.lotName) {
      return stock.stockLot.lotName;
    } else if (stock.stockLotId) {
      const lot = this.stockLots.find(l => l.stockLotId === stock.stockLotId);
      return lot?.lotName || `Lot ID: ${stock.stockLotId}`;
    }
    return 'No Lot';
  }
}
