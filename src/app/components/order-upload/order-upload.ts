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

  // ⭐ Gemini AI Status
  isGeminiProcessing: boolean = false;
  geminiProgress: string = '';

  // Customer สำหรับ 24Shop และ TikTok
  orderNumber: string = '';  // เฉพาะ 24Shop
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
      this.uploadResult = null;
      this.previewItems = [];
      this.previewOrders = [];
      this.uploadMessages = [];
      this.parsingMethod = null;
      this.parsingAccuracy = 0;
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
      this.uploadResult = null;
      this.previewItems = [];
      this.previewOrders = [];
      this.parsingMethod = null;
      this.parsingAccuracy = 0;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadResult = null;
    this.previewItems = [];
    this.previewOrders = [];
    this.uploadMessages = [];
    this.parsingMethod = null;
    this.parsingAccuracy = 0;

    if (this.uploadType === 'tiktok') {
      this.selectedCustomerId = null;
      this.searchCustomerTerm = '';
    }
  }

  // ============================================
  // ⭐ PREVIEW FILE
  // ============================================
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
        console.error('Error previewing 24Shop:', error);
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
        console.error('Error previewing Shopee:', error);
        alert('เกิดข้อผิดพลาด: ' + (error.error?.message || error.message));
        this.uploading = false;
      }
    });
  }

  // ⭐ Preview TikTok Excel with Gemini AI
  previewTiktok(): void {
    this.isGeminiProcessing = true;
    this.geminiProgress = '🤖 Gemini AI กำลังวิเคราะห์ TikTok Excel...';
    this.parsingMethod = 'gemini';

    this.orderService.previewTiktokExcel(this.selectedFile!).subscribe({
      next: (response) => {
        this.isGeminiProcessing = false;

        if (response.success) {
          // ⭐ เก็บ orders สำหรับแสดง summary
          if (response.orders && response.orders.length > 0) {
            this.previewOrders = response.orders.map((order: any) => ({
              ...order,
              source: 'TIKTOK',
              customerName: 'TikTok Customer (ยังไม่ระบุ)'
            }));

            // ⭐ แปลง items เป็น flat list (เหมือน 24Shop)
            this.previewItems = [];
            response.orders.forEach((order: any) => {
              if (order.items) {
                order.items.forEach((item: any) => {
                  this.previewItems.push({
                    productSku: item.productSku,
                    productName: item.productName || `TikTok Product - ${item.productSku}`,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice || 0,
                    totalPrice: item.totalPrice || 0
                  });
                });
              }
            });

            this.parsingAccuracy = 95;
            this.geminiProgress = `✅ Gemini AI วิเคราะห์สำเร็จ (${response.totalOrders} ออเดอร์, ${this.previewItems.length} รายการสินค้า)`;

            alert(`🤖 Gemini AI วิเคราะห์ TikTok Excel สำเร็จ\nพบ ${response.totalOrders} ออเดอร์\n${this.previewItems.length} รายการสินค้า`);
          }
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }
        this.uploading = false;
      },
      error: (error) => {
        console.error('Error previewing TikTok:', error);
        this.isGeminiProcessing = false;
        this.geminiProgress = '❌ Gemini AI เกิดข้อผิดพลาด';
        alert('เกิดข้อผิดพลาด: ' + (error.error?.message || error.message));
        this.uploading = false;
      }
    });
  }
  /**
   * ⭐ ตรวจสอบว่ามี Product ที่ไม่พบหรือไม่
   */
  hasNotFoundProducts(): boolean {
    return this.previewItems.some(item => item.found === false);
  }

// ⭐ Helper Methods
  getTotalItemsCount(): number {
    return this.previewOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0);
  }

  getGrandTotal(): number {
    return this.previewOrders.reduce((sum, order) => sum + (order.netAmount || 0), 0);
  }

  // hasNotFoundProducts(): boolean {
  //   return this.previewOrders.some(order =>
  //     order.items?.some(item => item.found === false)
  //   );
  // }
  // ============================================
  // ⭐ UPLOAD FILE
  // ============================================
  uploadFile(): void {
    if (this.uploadType === '24shop') {
      this.upload24Shop();
    } else if (this.uploadType === 'shopee') {
      this.uploadShopee();
    } else if (this.uploadType === 'tiktok') {
      this.uploadTiktok();
    }
  }

  // ⭐ Upload 24Shop
  upload24Shop(): void {
    if (!this.validateUpload()) {
      return;
    }

    this.previewMode = false;
    this.uploading = true;
    this.uploadMessages = [];
    this.isGeminiProcessing = true;
    this.geminiProgress = '🤖 Gemini AI กำลังประมวลผล...';

    this.orderService.upload24ShopPDFWithCustomer(
      this.selectedFile!,
      this.orderNumber,
      this.selectedCustomerId!,
      this.autoDeductStock  // ส่งไปแต่ Backend จะไม่ใช้
    ).subscribe({
      next: (response) => {
        this.isGeminiProcessing = false;
        this.uploadResult = response;

        if (response.success) {
          let successMessage = `✅ อัพโหลด 24Shop สำเร็จ!\n\n`;
          successMessage += `เลขออเดอร์: ${response.orderNumber}\n`;
          successMessage += `จำนวนสินค้า: ${response.itemsCount} รายการ\n\n`;
          successMessage += `⚠️ การดำเนินการต่อไป:\n`;
          successMessage += `1. ไปที่หน้ารายการ Orders\n`;
          successMessage += `2. เช็คและตัด Stock ด้วยตัวเอง\n`;
          successMessage += `3. เปลี่ยนสถานะชำระเงินเมื่อได้รับเงิน`;

          alert(successMessage);

          setTimeout(() => {
            this.router.navigate(['/orders']);
          }, 2000);
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }

        this.uploading = false;
      },
      error: (error) => {
        console.error('Error uploading 24Shop:', error);
        this.isGeminiProcessing = false;
        this.geminiProgress = '❌ เกิดข้อผิดพลาด';
        alert('เกิดข้อผิดพลาด: ' + (error.error?.message || error.message));
        this.uploading = false;
      }
    });
  }
  uploadTiktok(): void {
    if (!this.validateUpload()) {
      return;
    }

    this.uploading = true;
    this.uploadMessages = [];
    this.isGeminiProcessing = true;
    this.geminiProgress = '🤖 Gemini AI กำลังวิเคราะห์ TikTok Excel...';

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
          let successMessage = `✅ อัพโหลด TikTok Orders สำเร็จ!\n\n`;
          successMessage += `📦 จำนวน Orders: ${response.totalOrders}\n`;
          successMessage += `📋 จำนวนสินค้า: ${response.totalItems} รายการ\n\n`;
          successMessage += `⚠️ การดำเนินการต่อไป:\n`;
          successMessage += `1. ตรวจสอบข้อมูล Orders ในหน้ารายการ\n`;
          successMessage += `2. เช็คและตัด Stock ด้วยตัวเอง\n`;
          successMessage += `3. เปลี่ยนสถานะชำระเงินเมื่อได้รับเงิน`;

          alert(successMessage);

          setTimeout(() => {
            this.router.navigate(['/orders']);
          }, 2000);
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }

        this.uploading = false;
      },
      error: (error) => {
        console.error('❌ Upload Error:', error);

        this.isGeminiProcessing = false;
        this.geminiProgress = '❌ Gemini AI เกิดข้อผิดพลาด';

        let errorMessage = 'เกิดข้อผิดพลาด: ';

        if (error.error?.message) {
          errorMessage += error.error.message;
        } else if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์';
        }

        // ⭐ แสดง error แบบละเอียด
        console.error('Error Status:', error.status);
        console.error('Error Details:', error.error);

        alert(errorMessage);
        this.uploading = false;
      }
    });
  }

// ⭐ Upload Shopee
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
          let successMessage = `✅ อัพโหลด Shopee สำเร็จ!\n\n`;
          successMessage += `${response.message}\n\n`;
          successMessage += `⚠️ การดำเนินการต่อไป:\n`;
          successMessage += `1. ตรวจสอบข้อมูล Orders ในหน้ารายการ\n`;
          successMessage += `2. เช็คและตัด Stock ด้วยตัวเอง\n`;
          successMessage += `3. เปลี่ยนสถานะชำระเงินเมื่อได้รับเงิน`;

          alert(successMessage);

          setTimeout(() => {
            this.router.navigate(['/orders']);
          }, 2000);
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }

        this.uploading = false;
      },
      error: (error) => {
        console.error('Error uploading Shopee:', error);
        alert('เกิดข้อผิดพลาด: ' + (error.error?.message || error.message));
        this.uploading = false;
      }
    });
  }

  // ============================================
  // VALIDATION
  // ============================================
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

      const fileName = this.selectedFile.name.toLowerCase();
      if (!fileName.endsWith('.pdf')) {
        alert('กรุณาเลือกไฟล์ PDF สำหรับ 24Shop');
        return false;
      }
    }

    if (this.uploadType === 'tiktok') {
      if (!this.selectedCustomerId) {
        alert('กรุณาเลือกลูกค้า');
        return false;
      }

      const fileName = this.selectedFile.name.toLowerCase();
      if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
        alert('กรุณาเลือกไฟล์ Excel (.xlsx) สำหรับ TikTok');
        return false;
      }
    }

    return true;
  }

  // ============================================
  // HELPER METHODS
  // ============================================
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

  showSuccessNotification(title: string, message: string): void {
    console.log(`${title}: ${message}`);
  }

  getFileIcon(): string {
    if (!this.selectedFile) return 'bi-file-earmark';

    const fileName = this.selectedFile.name.toLowerCase();
    if (fileName.endsWith('.pdf')) return 'bi-file-earmark-pdf';
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return 'bi-file-earmark-excel';

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

  getTotalPreviewAmount(): number {
    return this.previewItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
