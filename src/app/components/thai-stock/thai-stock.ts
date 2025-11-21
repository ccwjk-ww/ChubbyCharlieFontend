import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThaiStockService, ThaiStock } from '../../services/thai-stock.service';
import { StockLotService, StockLot } from '../../services/stock-lot.service';
import {ChinaStock} from '../../services/china-stock.service';

@Component({
  selector: 'app-thai-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './thai-stock.html',
  styleUrls: ['./thai-stock.css']
})
export class ThaiStockComponent implements OnInit {
  // ⭐ เก็บ stocks ต้นฉบับแยกจาก filtered
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

  constructor(
    private thaiStockService: ThaiStockService,
    private stockLotService: StockLotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStockLots();
    this.loadThaiStocks();
  }

  get totalThaiStocks(): number {
    return this.filteredThaiStocks.length;
  }

  loadStockLots(): void {
    this.stockLotService.getAllStockLots().subscribe({
      next: (lots) => {
        this.stockLots = lots;
      },
      error: (error) => console.error('Error loading stock lots:', error)
    });
  }

  loadThaiStocks(): void {
    this.loading = true;
    this.thaiStockService.getAllThaiStocks().subscribe({
      next: (stocks) => {
        // ⭐ เก็บข้อมูลต้นฉบับ
        this.allThaiStocks = stocks;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Thai stocks:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    if (this.searchTerm.trim()) {
      this.thaiStockService.searchThaiStocks(this.searchTerm).subscribe({
        next: (stocks) => {
          this.allThaiStocks = stocks;
          this.applyFilters();
        },
        error: (error) => console.error('Error searching Thai stocks:', error)
      });
    } else {
      this.loadThaiStocks();
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
    let filtered = [...this.allThaiStocks];

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

    this.filteredThaiStocks = filtered;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredThaiStocks.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedThaiStocks = this.filteredThaiStocks.slice(startIndex, endIndex);
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

  openAddThaiStockModal(): void {
    this.router.navigate(['/thai-stocks/add']);
  }

  editThaiStock(stock: ThaiStock): void {
    this.router.navigate(['/thai-stocks/edit', stock.stockItemId]);
    this.closeDropdown();
  }

  updateThaiStockStatus(stock: ThaiStock, newStatus: string): void {
    if (stock.stockItemId) {
      this.thaiStockService.updateThaiStockStatus(stock.stockItemId, newStatus).subscribe({
        next: () => {
          this.loadThaiStocks();
          this.closeDropdown();
        },
        error: (error) => console.error('Error updating Thai stock status:', error)
      });
    }
  }

  deleteThaiStock(stock: ThaiStock): void {
    if (confirm(`Are you sure you want to delete ${stock.name}?`)) {
      if (stock.stockItemId) {
        this.thaiStockService.deleteThaiStock(stock.stockItemId).subscribe({
          next: () => {
            this.loadThaiStocks();
            this.closeDropdown();
          },
          error: (error) => console.error('Error deleting Thai stock:', error)
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

  toggleDropdown(event: Event, stock: ThaiStock): void {
    event.stopPropagation();
    if (this.activeThaiStock === stock) {
      this.closeDropdown();
    } else {
      this.activeThaiStock = stock;
      this.isDropdownOpen = true;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.activeThaiStock = null;
  }

  calculateGrandTotal(stock: ThaiStock): number {
    const priceTotal = stock.priceTotal || 0;
    const shippingCost = stock.shippingCost || 0;
    let total = priceTotal + shippingCost;

    if (stock.includeBuffer && stock.bufferPercentage && stock.bufferPercentage > 0) {
      total = total * (1 + stock.bufferPercentage / 100);
    }

    return total;
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
