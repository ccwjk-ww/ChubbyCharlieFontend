import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService, Customer, CustomerStats } from '../../services/customer.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.html',
  styleUrls: ['./customer.css']
})
export class CustomerComponent implements OnInit {
  // ⭐ เพิ่ม customers array เพื่อเก็บข้อมูลทั้งหมด
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  paginatedCustomers: Customer[] = [];
  searchTerm: string = '';
  selectedStatus: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  loading: boolean = false;
  isDropdownOpen: boolean = false;
  activeCustomer: Customer | null = null;

  // ⭐ Statistics
  stats: CustomerStats = { total: 0, active: 0, inactive: 0 };

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadStatistics();
  }

  get totalCustomers(): number {
    return this.filteredCustomers.length;
  }

  // ⭐ Load statistics
  loadStatistics(): void {
    this.customerService.getStatistics().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers.map(cust => ({
          ...cust,
          status: cust.status || 'ACTIVE' // Default เป็น ACTIVE
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  // ⭐ Filter by status
  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  // ⭐ Apply all filters (เหมือน Staff)
  applyFilters(): void {
    let filtered = [...this.customers];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(customer =>
        customer.customerName.toLowerCase().includes(searchLower) ||
        (customer.customerPhone && customer.customerPhone.includes(searchLower)) ||
        (customer.customerAddress && customer.customerAddress.toLowerCase().includes(searchLower))
      );
    }

    // Filter by status
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(customer => customer.status === this.selectedStatus);
    }

    this.filteredCustomers = filtered;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCustomers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    if (this.totalPages === 0) {
      this.currentPage = 1;
    }
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCustomers = this.filteredCustomers.slice(startIndex, endIndex);
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

  openAddCustomerModal(): void {
    this.router.navigate(['/customers/add']);
  }

  editCustomer(customer: Customer): void {
    this.router.navigate(['/customers/edit', customer.customerId]);
    this.closeDropdown();
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบ ${customer.customerName}?`)) {
      this.customerService.deleteCustomer(customer.customerId).subscribe({
        next: () => {
          alert('ลบลูกค้าสำเร็จ');
          this.loadCustomers();
          this.loadStatistics();
          this.closeDropdown();
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
          alert('เกิดข้อผิดพลาดในการลบลูกค้า');
        }
      });
    }
  }

  toggleDropdown(event: Event, customer: Customer): void {
    event.stopPropagation();
    if (this.activeCustomer === customer) {
      this.closeDropdown();
    } else {
      this.activeCustomer = customer;
      this.isDropdownOpen = true;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.activeCustomer = null;
  }

  onDocumentClick(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    }
  }

  // ⭐ Get status badge class
  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'ACTIVE':
        return 'badge badge-green';
      case 'INACTIVE':
        return 'badge badge-red';
      default:
        return 'badge badge-gray';
    }
  }

  // ⭐ Format date
  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected readonly Math = Math;
}
