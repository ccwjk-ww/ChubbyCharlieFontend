import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { ProductService, Product } from '../../services/product.service';

interface OrderItemForm {
  productId?: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  notes: string;
}

@Component({
  selector: 'app-order-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-add.html',
  styleUrls: ['./order-add.css']
})
export class OrderAddComponent implements OnInit {
  isEditMode: boolean = false;
  orderId: number | null = null;
  loading: boolean = false;
  submitting: boolean = false;

  // Form data
  orderNumber: string = '';
  source: string = 'MANUAL';
  customerName: string = '';
  customerPhone: string = '';
  shippingAddress: string = '';
  orderDate: string = '';
  deliveryDate: string = '';
  shippingFee: number = 0;
  discount: number = 0;
  notes: string = '';

  // ⭐ VAT
  vatEnabled: boolean = false;
  vatRate: number = 7;
  vatAmount: number = 0;

  // Order items
  orderItems: OrderItemForm[] = [];

  // Products for autocomplete
  products: Product[] = [];
  filteredProducts: Product[] = [];
  showSuggestions: boolean[] = [];

  // Calculated totals
  subtotal: number = 0;
  netAmount: number = 0;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeOrderDate();
    this.addOrderItem();
    this.loadProducts();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.orderId = Number(id);
      this.loadOrder();
    }
  }

  initializeOrderDate(): void {
    const now = new Date();
    this.orderDate = this.formatDateForInput(now);
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
      },
      error: (error) => console.error('Error loading products:', error)
    });
  }

  loadOrder(): void {
    if (this.orderId) {
      this.loading = true;
      this.orderService.getOrderById(this.orderId).subscribe({
        next: (order) => {
          this.populateFormWithOrder(order);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading order:', error);
          alert('ไม่สามารถโหลดข้อมูลออเดอร์ได้');
          this.router.navigate(['/orders']);
        }
      });
    }
  }

  populateFormWithOrder(order: Order): void {
    this.orderNumber = order.orderNumber;
    this.source = order.source || 'MANUAL';
    this.customerName = order.customerName || '';
    this.customerPhone = order.customerPhone || '';
    this.shippingAddress = order.shippingAddress || '';
    this.orderDate = order.orderDate ? this.formatDateForInput(new Date(order.orderDate)) : '';
    this.deliveryDate = order.deliveryDate ? this.formatDateForInput(new Date(order.deliveryDate)) : '';
    this.shippingFee = order.shippingFee || 0;
    this.discount = order.discount || 0;
    this.notes = order.notes || '';

    // ⭐ VAT
    this.vatEnabled = order.vatEnabled || false;
    this.vatRate = order.vatRate || 7;

    this.orderItems = [];
    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach(item => {
        this.orderItems.push({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          totalPrice: item.totalPrice || 0,
          notes: item.notes || ''
        });
        this.showSuggestions.push(false);
      });
    } else {
      this.addOrderItem();
    }

    this.calculateTotals();
  }

  addOrderItem(): void {
    this.orderItems.push({
      productName: '',
      productSku: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      totalPrice: 0,
      notes: ''
    });
    this.showSuggestions.push(false);
  }

  removeOrderItem(index: number): void {
    if (this.orderItems.length > 1) {
      this.orderItems.splice(index, 1);
      this.showSuggestions.splice(index, 1);
      this.calculateTotals();
    } else {
      alert('ต้องมีรายการสินค้าอย่างน้อย 1 รายการ');
    }
  }

  onProductSearch(index: number, searchTerm: string): void {
    if (searchTerm.length > 0) {
      this.filteredProducts = this.products.filter(p =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      this.showSuggestions[index] = this.filteredProducts.length > 0;
    } else {
      this.filteredProducts = [];
      this.showSuggestions[index] = false;
    }
  }

  selectProduct(index: number, product: Product): void {
    this.orderItems[index].productId = product.productId;
    this.orderItems[index].productName = product.productName;
    this.orderItems[index].productSku = product.sku || '';
    this.orderItems[index].unitPrice = product.sellingPrice || 0;
    this.showSuggestions[index] = false;
    this.calculateItemTotal(index);
  }

  hideSuggestions(index: number): void {
    setTimeout(() => {
      this.showSuggestions[index] = false;
    }, 200);
  }

  calculateItemTotal(index: number): void {
    const item = this.orderItems[index];
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const discount = item.discount || 0;
    const subtotal = quantity * unitPrice;
    const totalPrice = subtotal - discount;
    item.totalPrice = (isNaN(totalPrice) || totalPrice < 0) ? 0 : totalPrice;
    this.calculateTotals();
  }

  // ⭐ calculateTotals พร้อม VAT
  calculateTotals(): void {
    this.subtotal = this.orderItems.reduce((sum, item) => {
      const itemTotal = item.totalPrice || 0;
      return sum + itemTotal;
    }, 0);

    const shippingAmount = this.shippingFee || 0;
    const discountAmount = this.discount || 0;
    const beforeVat = this.subtotal + shippingAmount - discountAmount;

    // ⭐ คำนวณ VAT
    if (this.vatEnabled && this.vatRate > 0) {
      this.vatAmount = Math.round(beforeVat * (this.vatRate / 100) * 100) / 100;
    } else {
      this.vatAmount = 0;
    }

    this.netAmount = beforeVat + this.vatAmount;

    if (this.netAmount < 0) {
      this.netAmount = 0;
    }
  }

  // ⭐ เรียกเมื่อ toggle VAT checkbox
  onVatToggle(): void {
    if (!this.vatEnabled) {
      this.vatAmount = 0;
    }
    this.calculateTotals();
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.submitting = true;

    const orderData = {
      orderNumber: this.orderNumber || undefined,
      source: this.source,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      shippingAddress: this.shippingAddress,
      orderDate: this.orderDate ? new Date(this.orderDate).toISOString() : undefined,
      deliveryDate: this.deliveryDate ? new Date(this.deliveryDate).toISOString() : undefined,
      shippingFee: this.shippingFee || 0,
      discount: this.discount || 0,
      notes: this.notes,
      // ⭐ VAT
      vatEnabled: this.vatEnabled,
      vatRate: this.vatEnabled ? (this.vatRate || 7) : null,
      orderItems: this.orderItems.map(item => {
        const quantity = item.quantity || 1;
        const unitPrice = item.unitPrice || 0;
        const discount = item.discount || 0;
        const subtotal = quantity * unitPrice;
        const totalPrice = subtotal - discount;

        return {
          productId: item.productId,
          productName: item.productName || '',
          productSku: item.productSku || '',
          quantity: quantity,
          unitPrice: unitPrice,
          discount: discount,
          totalPrice: totalPrice >= 0 ? totalPrice : 0,
          notes: item.notes || ''
        };
      })
    };

    const operation = this.isEditMode
      ? this.orderService.updateOrder(this.orderId!, orderData)
      : this.orderService.createOrder(orderData);

    operation.subscribe({
      next: (response) => {
        const message = this.isEditMode ? 'แก้ไขออเดอร์สำเร็จ' : 'สร้างออเดอร์สำเร็จ';
        alert(message);
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        console.error('Error saving order:', error);
        alert('เกิดข้อผิดพลาด: ' + (error.error?.message || error.message));
        this.submitting = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.customerName.trim()) {
      alert('กรุณากรอกชื่อลูกค้า');
      return false;
    }

    if (this.orderItems.length === 0) {
      alert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
      return false;
    }

    // ⭐ ตรวจสอบ VAT Rate
    if (this.vatEnabled && (!this.vatRate || this.vatRate <= 0 || this.vatRate > 100)) {
      alert('กรุณากรอก VAT (%) ให้ถูกต้อง (1-100)');
      return false;
    }

    for (let i = 0; i < this.orderItems.length; i++) {
      const item = this.orderItems[i];

      if (!item.productName || !item.productName.trim()) {
        alert(`รายการที่ ${i + 1}: กรุณากรอกชื่อสินค้า`);
        return false;
      }

      if (!item.quantity || item.quantity <= 0) {
        alert(`รายการที่ ${i + 1}: จำนวนต้องมากกว่า 0`);
        return false;
      }

      if (item.unitPrice === null || item.unitPrice === undefined || item.unitPrice < 0) {
        alert(`รายการที่ ${i + 1}: ราคาต้องไม่ติดลบ`);
        return false;
      }
    }

    return true;
  }

  goBack(): void {
    if (confirm('ต้องการยกเลิกและกลับหรือไม่? ข้อมูลที่กรอกจะหายไป')) {
      this.router.navigate(['/orders']);
    }
  }

  formatCurrency(amount: number | null | undefined): string {
    const value = amount ?? 0;

    if (isNaN(value)) {
      return '฿0.00';
    }

    return `฿${value.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}
