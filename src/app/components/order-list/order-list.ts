import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-list.html',
  styleUrls: ['./order-list.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  paginatedOrders: Order[] = [];

  searchTerm: string = '';
  selectedStatus: string = 'ALL';
  selectedSource: string = 'ALL';
  selectedPaymentStatus: string = 'ALL';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  loading: boolean = false;

  isDropdownOpen: boolean = false;
  activeOrder: Order | null = null;

  // ⭐ เพิ่ม computed totals
  totalRevenue: number = 0;
  totalCost: number = 0;
  totalProfit: number = 0;


  statusOptions = [
    { value: 'ALL', label: 'ทุกสถานะ' },
    { value: 'PENDING', label: 'รอดำเนินการ' },
    { value: 'CONFIRMED', label: 'ยืนยันแล้ว' },
    { value: 'PROCESSING', label: 'กำลังจัดเตรียม' },
    { value: 'PACKED', label: 'แพ็คของแล้ว' },
    { value: 'SHIPPED', label: 'จัดส่งแล้ว' },
    { value: 'DELIVERED', label: 'ส่งถึงแล้ว' },
    { value: 'CANCELLED', label: 'ยกเลิก' },
    { value: 'RETURNED', label: 'คืนสินค้า' }
  ];

  sourceOptions = [
    { value: 'ALL', label: 'ทุกแหล่ง' },
    { value: 'SHOP_24', label: '24Shop' },
    { value: 'SHOPEE', label: 'Shopee' },
    { value: 'TIKTOK', label: 'TikTok' },  // ⭐ เพิ่ม TikTok
    { value: 'MANUAL', label: 'Manual' }
  ];

  paymentStatusOptions = [
    { value: 'ALL', label: 'ทุกสถานะ' },
    { value: 'UNPAID', label: 'ยังไม่ชำระ' },
    { value: 'PAID', label: 'ชำระแล้ว' },
    { value: 'REFUNDED', label: 'คืนเงินแล้ว' }
  ];

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  get totalOrders(): number {
    return this.filteredOrders.length;
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.calculateTotals(); // ⭐ คำนวณยอดรวม
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  // แก้ calculateTotals()
  calculateTotals(): void {
    const activeOrders = this.filteredOrders.filter(
      o => o.status !== 'CANCELLED' && o.status !== 'RETURNED'
    );

    this.totalRevenue = activeOrders
      .reduce((sum, order) => sum + (order.netAmount || 0), 0);

    this.totalCost = activeOrders
      .reduce((sum, order) => sum + (order.totalCost || 0), 0);

    this.totalProfit = activeOrders
      .reduce((sum, order) => sum + (order.profit || 0), 0);
  }

  onSearch(): void {
    this.currentPage = 1;
    if (this.searchTerm.trim()) {
      this.orderService.searchOrders(this.searchTerm).subscribe({
        next: (orders) => {
          this.filteredOrders = orders;
          this.applyFilters();
        },
        error: (error) => console.error('Error searching orders:', error)
      });
    } else {
      this.applyFilters();
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    if (this.selectedSource !== 'ALL') {
      filtered = filtered.filter(order => order.source === this.selectedSource);
    }

    if (this.selectedPaymentStatus !== 'ALL') {
      filtered = filtered.filter(order => order.paymentStatus === this.selectedPaymentStatus);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(term) ||
        order.customerName?.toLowerCase().includes(term) ||
        order.customerPhone?.includes(term)
      );
    }

    this.filteredOrders = filtered;
    this.calculateTotals(); // ⭐ คำนวณยอดรวมใหม่
    this.calculatePagination();
    this.updatePaginatedData();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedOrders = this.filteredOrders.slice(startIndex, endIndex);
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

  getPageNumbers(): number[] {
    const pages = [];
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + 4);
      if (end - start < 4) {
        start = Math.max(1, end - 4);
      }
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  }

  getRowNumber(index: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + index + 1;
  }

  viewOrderDetails(order: Order): void {
    this.router.navigate(['/orders', order.orderId]);
  }

  goToUploadPage(): void {
    this.router.navigate(['/orders/upload']);
  }

  goToAddManualOrder(): void {
    this.router.navigate(['/orders/add']);
  }

  editOrder(order: Order): void {
    this.router.navigate(['/orders/edit', order.orderId]);
    this.closeDropdown();
  }

  deductStock(order: Order): void {
    if (confirm(`ต้องการตัด Stock สำหรับ Order ${order.orderNumber}?`)) {
      this.orderService.deductStockForOrder(order.orderId!).subscribe({
        next: (response) => {
          alert('ตัด Stock สำเร็จ!\n' + response.messages.join('\n'));
          this.loadOrders();
          this.closeDropdown();
        },
        error: (error) => {
          console.error('Error deducting stock:', error);
          alert('เกิดข้อผิดพลาดในการตัด Stock');
        }
      });
    }
  }

  checkStock(order: Order): void {
    this.orderService.checkStockAvailability(order.orderId!).subscribe({
      next: (response) => {
        alert(response.message);
      },
      error: (error) => console.error('Error checking stock:', error)
    });
    this.closeDropdown();
  }

  cancelOrder(order: Order): void {
    if (confirm(`ต้องการยกเลิก Order ${order.orderNumber}?`)) {
      this.orderService.cancelOrder(order.orderId!).subscribe({
        next: () => {
          alert('ยกเลิก Order สำเร็จ');
          this.loadOrders();
          this.closeDropdown();
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          alert('เกิดข้อผิดพลาดในการยกเลิก Order');
        }
      });
    }
  }

  deleteOrder(order: Order): void {
    if (confirm(`ต้องการลบ Order ${order.orderNumber}? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      this.orderService.deleteOrder(order.orderId!).subscribe({
        next: () => {
          alert('ลบ Order สำเร็จ');
          this.loadOrders();
          this.closeDropdown();
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          alert('เกิดข้อผิดพลาดในการลบ Order');
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

  getSourceClass(source: string | undefined): string {
    switch (source) {
      case 'SHOP_24': return 'badge badge-blue';
      case 'SHOPEE': return 'badge badge-orange';
      case 'TIKTOK': return 'badge badge-tiktok';  // ⭐ เพิ่ม TikTok style
      case 'MANUAL': return 'badge badge-gray';
      default: return 'badge badge-gray';
    }
  }

  formatCurrency(amount: number | undefined | null): string {
    const value = amount ?? 0;
    return `฿${value.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH');
  }

  toggleDropdown(event: Event, order: Order): void {
    event.stopPropagation();
    if (this.activeOrder === order) {
      this.closeDropdown();
    } else {
      this.activeOrder = order;
      this.isDropdownOpen = true;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.activeOrder = null;
  }

  onDocumentClick(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    }
  }

  protected readonly Math = Math;
}
