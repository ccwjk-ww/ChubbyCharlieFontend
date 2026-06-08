import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CustomerService, Customer } from '../../services/customer.service';

@Component({
  selector: 'app-order-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-upload.html',
  styleUrls: ['./order-upload.css']
})
export class OrderUploadComponent implements OnInit {
  selectedFile: File | null = null;
  uploadType: '24shop' | 'shopee' | 'tiktok' = '24shop';
  autoDeductStock: boolean = true;
  uploading: boolean = false;
  previewMode: boolean = false;

  isGeminiProcessing: boolean = false;
  geminiProgress: string = '';

  orderNumber: string = '';
  selectedCustomerId: number | null = null;
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchCustomerTerm: string = '';
  showCustomerDropdown: boolean = false;

  uploadResult: any = null;
  previewItems: any[] = [];
  previewOrders: any[] = [];
  uploadMessages: string[] = [];

  parsingMethod: 'gemini' | 'traditional' | null = null;
  parsingAccuracy: number = 0;

  // ⭐ Scan result (VAT report — read-only, no DB save)
  scanResult: any = null;
  scanRows: any[] = [];
  scanSummary: any = null;
  isScanning: boolean = false;

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.filteredCustomers = customers;
      },
      error: (error) => console.error('Error loading customers:', error)
    });
  }

  hideCustomerDropdown(): void {
    setTimeout(() => {
      this.showCustomerDropdown = false;
    }, 200);
  }

  onCustomerSearch(): void {
    if (this.searchCustomerTerm.trim()) {
      this.filteredCustomers = this.customers.filter(c =>
        c.customerName.toLowerCase().includes(this.searchCustomerTerm.toLowerCase()) ||
        (c.customerPhone && c.customerPhone.includes(this.searchCustomerTerm))
      );
    } else {
      this.filteredCustomers = this.customers;
    }
    this.showCustomerDropdown = this.filteredCustomers.length > 0;
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomerId = customer.customerId!;
    this.searchCustomerTerm = customer.customerName;
    this.showCustomerDropdown = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.resetResults();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.resetResults();
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.resetResults();
    if (this.uploadType === 'tiktok') {
      this.selectedCustomerId = null;
      this.searchCustomerTerm = '';
    }
  }

  private resetResults(): void {
    this.uploadResult = null;
    this.previewItems = [];
    this.previewOrders = [];
    this.uploadMessages = [];
    this.parsingMethod = null;
    this.parsingAccuracy = 0;
    this.scanResult = null;
    this.scanRows = [];
    this.scanSummary = null;
  }

  // ============================================================
  // PREVIEW
  // ============================================================
  previewFile(): void {
    if (!this.selectedFile) {
      alert('กรุณาเลือกไฟล์');
      return;
    }
    this.previewMode = true;
    this.uploading = true;

    if (this.uploadType === '24shop') {
      this.preview24Shop();
    } else if (this.uploadType === 'shopee') {
      this.previewShopee();
    } else if (this.uploadType === 'tiktok') {
      this.previewTiktok();
    }
  }

  preview24Shop(): void {
    this.isGeminiProcessing = true;
    this.geminiProgress = 'กำลังวิเคราะห์ PDF ด้วย Gemini AI...';

    this.orderService.preview24ShopPDF(this.selectedFile!).subscribe({
      next: (response) => {
        this.isGeminiProcessing = false;
        if (response.success) {
          this.previewItems = response.items || [];
          this.previewOrders = [];
          if (response.parsedWith === 'Gemini AI') {
            this.parsingMethod = 'gemini';
            this.parsingAccuracy = this.calculateAccuracy(this.previewItems);
            this.geminiProgress = `✅ วิเคราะห์ด้วย Gemini AI สำเร็จ (${response.itemsCount} รายการ)`;
          }
          alert(`🤖 Gemini AI วิเคราะห์สำเร็จ\nพบ ${response.itemsCount} รายการสินค้า`);
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }
        this.uploading = false;
      },
      error: (error) => {
        this.isGeminiProcessing = false;
        this.geminiProgress = '❌ เกิดข้อผิดพลาด';
        alert('เกิดข้อผิดพลาด: ' + (error.error?.message || error.message));
        this.uploading = false;
      }
    });
  }

  previewShopee(): void {
    this.orderService.previewExcel(this.selectedFile!).subscribe({
      next: (response) => {
        if (response.success) {
          this.previewOrders = response.orders || [];
          this.previewItems = [];
          alert(`แสดงตัวอย่างสำเร็จ - พบ ${this.previewOrders.length} ออเดอร์`);
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }
        this.uploading = false;
      },
      error: (error) => {
        alert('เกิดข้อผิดพลาด: ' + (error.error?.message || error.message));
        this.uploading = false;
      }
    });
  }

  /**
   * ⭐ Preview TikTok — ใช้ Apache POI โดยตรง (ไม่ต้องใช้ Gemini)
   * Response format: { success, totalOrders, orders: [{orderId, orderStatus, productName, ...}], summary }
   */
  previewTiktok(): void {
    this.geminiProgress = '📊 กำลังอ่าน TikTok Excel...';
    this.isGeminiProcessing = true;
    this.parsingMethod = null;

    this.orderService.previewTiktokExcel(this.selectedFile!, this.selectedCustomerId || undefined).subscribe({
      next: (response) => {
        this.isGeminiProcessing = false;

        if (response.success) {
          // ⭐ response.orders = flat list of order-rows from Excel
          // Each row = 1 order with product info
          this.previewOrders = response.orders || [];
          this.previewItems = [];

          // แปลง preview orders เป็น previewItems สำหรับ table display
          this.previewItems = this.previewOrders.map((o: any) => ({
            productSku:   o.sellerSku || o.skuId || '',
            productName:  o.productName || '',
            quantity:     o.quantity || 0,
            unitPrice:    o.unitPrice || 0,
            totalPrice:   o.orderAmount || 0,
            orderId:      o.orderId || '',
            orderStatus:  o.orderStatus || '',
            variation:    o.variation || '',
          }));

          this.parsingMethod = 'traditional';
          this.parsingAccuracy = 99;
          this.geminiProgress = `✅ อ่าน TikTok Excel สำเร็จ (${response.totalOrders} ออเดอร์)`;

          alert(`📊 อ่าน TikTok Excel สำเร็จ\nพบ ${response.totalOrders} ออเดอร์\n\nกด "อัพโหลด" เพื่อบันทึกทั้งหมด`);
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }
        this.uploading = false;
      },
      error: (error) => {
        this.isGeminiProcessing = false;
        this.geminiProgress = '❌ เกิดข้อผิดพลาด';
        alert('เกิดข้อผิดพลาด: ' + (error.error?.message || error.message));
        this.uploading = false;
      }
    });
  }

  hasNotFoundProducts(): boolean {
    return this.previewItems.some(item => item.found === false);
  }

  getTotalItemsCount(): number {
    return this.previewOrders.length;
  }

  getGrandTotal(): number {
    return this.previewOrders.reduce((sum: number, order: any) => sum + (order.orderAmount || 0), 0);
  }

  // ============================================================
  // UPLOAD
  // ============================================================
  uploadFile(): void {
    if (this.uploadType === '24shop') {
      this.upload24Shop();
    } else if (this.uploadType === 'shopee') {
      this.uploadShopee();
    } else if (this.uploadType === 'tiktok') {
      this.uploadTiktok();
    }
  }

  upload24Shop(): void {
    if (!this.validateUpload()) return;

    this.previewMode = false;
    this.uploading = true;
    this.uploadMessages = [];
    this.isGeminiProcessing = true;
    this.geminiProgress = '🤖 Gemini AI กำลังประมวลผล...';

    this.orderService.upload24ShopPDFWithCustomer(
      this.selectedFile!,
      this.orderNumber,
      this.selectedCustomerId!,
      this.autoDeductStock
    ).subscribe({
      next: (response) => {
        this.isGeminiProcessing = false;
        this.uploadResult = response;

        if (response.success) {
          alert(`✅ อัพโหลด 24Shop สำเร็จ!\n\nเลขออเดอร์: ${response.orderNumber}\nจำนวนสินค้า: ${response.itemsCount} รายการ\n\n⚠️ กรุณาตัด Stock ด้วยตัวเอง`);
          setTimeout(() => this.router.navigate(['/orders']), 2000);
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }
        this.uploading = false;
      },
      error: (error) => {
        this.isGeminiProcessing = false;
        this.geminiProgress = '❌ เกิดข้อผิดพลาด';
        alert('เกิดข้อผิดพลาด: ' + (error.error?.message || error.message));
        this.uploading = false;
      }
    });
  }

  /**
   * ⭐ Upload TikTok — ส่งไฟล์ไป backend ที่ใช้ Apache POI โดยตรง
   * Response: { success, totalOrders, successCount, errorCount, totalItems, orders, parsedWith }
   */
  uploadTiktok(): void {
    if (!this.validateUpload()) return;

    this.uploading = true;
    this.uploadMessages = [];
    this.geminiProgress = '📊 กำลังนำเข้า TikTok Orders...';
    this.isGeminiProcessing = true;

    console.log('========== Starting TikTok Upload ==========');
    console.log('File:', this.selectedFile?.name);
    console.log('Customer ID:', this.selectedCustomerId);

    this.orderService.uploadTiktokExcel(
      this.selectedFile!,
      this.selectedCustomerId!,
      this.autoDeductStock
    ).subscribe({
      next: (response) => {
        console.log('✅ Upload Response:', response);

        this.isGeminiProcessing = false;
        this.uploadResult = response;

        if (response.success) {
          const successCount = response.successCount || response.totalOrders || 0;
          const errorCount   = response.errorCount || 0;
          const totalItems   = response.totalItems || 0;

          let successMessage = `✅ อัพโหลด TikTok Orders สำเร็จ!\n\n`;
          successMessage += `📦 บันทึก Orders: ${successCount} รายการ\n`;
          if (errorCount > 0) {
            successMessage += `⚠️ บันทึกไม่สำเร็จ: ${errorCount} รายการ\n`;
          }
          successMessage += `📋 จำนวนสินค้ารวม: ${totalItems} รายการ\n\n`;
          successMessage += `⚠️ กรุณาตัด Stock ด้วยตัวเอง`;

          alert(successMessage);
          setTimeout(() => this.router.navigate(['/orders']), 2000);
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }

        this.uploading = false;
      },
      error: (error) => {
        console.error('❌ Upload Error:', error);

        this.isGeminiProcessing = false;
        this.geminiProgress = '❌ เกิดข้อผิดพลาด';

        let errorMessage = 'เกิดข้อผิดพลาด: ';
        if (error.error?.message) {
          errorMessage += error.error.message;
        } else if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์';
        }

        console.error('Error Status:', error.status);
        console.error('Error Details:', error.error);

        alert(errorMessage);
        this.uploading = false;
      }
    });
  }

  uploadShopee(): void {
    if (!this.selectedFile) {
      alert('กรุณาเลือกไฟล์');
      return;
    }

    this.uploading = true;
    this.uploadMessages = [];

    this.orderService.uploadShopeeExcel(this.selectedFile, this.autoDeductStock).subscribe({
      next: (response) => {
        this.uploadResult = response;

        if (response.success) {
          alert(`✅ อัพโหลด Shopee สำเร็จ!\n\n${response.message}\n\n⚠️ กรุณาตัด Stock ด้วยตัวเอง`);
          setTimeout(() => this.router.navigate(['/orders']), 2000);
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }

        this.uploading = false;
      },
      error: (error) => {
        alert('เกิดข้อผิดพลาด: ' + (error.error?.message || error.message));
        this.uploading = false;
      }
    });
  }

  // ============================================================
  // ⭐ SCAN (VAT Report — read-only, no DB save)
  // ============================================================
  scanTiktokFile(): void {
    if (!this.selectedFile) {
      alert('กรุณาเลือกไฟล์');
      return;
    }

    this.isScanning = true;
    this.scanResult = null;
    this.scanRows = [];
    this.scanSummary = null;
    this.geminiProgress = '📊 กำลัง Scan TikTok Excel คำนวณ VAT...';
    this.isGeminiProcessing = true;

    this.orderService.scanTiktokExcel(this.selectedFile).subscribe({
      next: (response) => {
        this.isGeminiProcessing = false;
        this.isScanning = false;
        if (response.success) {
          this.scanRows    = response.rows    || [];
          this.scanSummary = response.summary || null;
          this.geminiProgress = `✅ Scan สำเร็จ (${this.scanRows.length} แถว)`;
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }
      },
      error: (error) => {
        this.isGeminiProcessing = false;
        this.isScanning = false;
        alert('เกิดข้อผิดพลาด: ' + (error.error?.message || error.message));
      }
    });
  }

  // ============================================================
  // VALIDATION
  // ============================================================
  validateUpload(): boolean {
    if (!this.selectedFile) {
      alert('กรุณาเลือกไฟล์');
      return false;
    }

    if (this.uploadType === '24shop') {
      if (!this.orderNumber.trim()) {
        alert('กรุณาระบุเลขที่ออเดอร์ (PO Number)');
        return false;
      }
      if (!this.selectedCustomerId) {
        alert('กรุณาเลือกลูกค้า');
        return false;
      }
      if (!this.selectedFile.name.toLowerCase().endsWith('.pdf')) {
        alert('กรุณาเลือกไฟล์ PDF สำหรับ 24Shop');
        return false;
      }
    }

    if (this.uploadType === 'tiktok') {
      if (!this.selectedCustomerId) {
        alert('กรุณาเลือกลูกค้าก่อนอัพโหลด');
        return false;
      }
      const fn = this.selectedFile.name.toLowerCase();
      if (!fn.endsWith('.xlsx') && !fn.endsWith('.xls')) {
        alert('กรุณาเลือกไฟล์ Excel (.xlsx) สำหรับ TikTok');
        return false;
      }
    }

    return true;
  }

  // ============================================================
  // HELPERS
  // ============================================================
  calculateAccuracy(items: any[]): number {
    if (!items || items.length === 0) return 0;
    let totalScore = 0;
    items.forEach(item => {
      let score = 0;
      if (item.productSku && item.productSku.trim()) score += 20;
      if (item.productName && item.productName.trim()) score += 20;
      if (item.quantity > 0) score += 20;
      if (item.unitPrice > 0) score += 20;
      if (item.totalPrice > 0) score += 20;
      totalScore += score;
    });
    return Math.round(totalScore / items.length);
  }

  getFileIcon(): string {
    if (!this.selectedFile) return 'bi-file-earmark';
    const fn = this.selectedFile.name.toLowerCase();
    if (fn.endsWith('.pdf')) return 'bi-file-earmark-pdf';
    if (fn.endsWith('.xlsx') || fn.endsWith('.xls')) return 'bi-file-earmark-excel';
    return 'bi-file-earmark';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  formatCurrency(amount: number): string {
    return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDecimal(val: any): string {
    const n = parseFloat(val) || 0;
    return `฿${n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getTotalPreviewAmount(): number {
    return this.previewItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
