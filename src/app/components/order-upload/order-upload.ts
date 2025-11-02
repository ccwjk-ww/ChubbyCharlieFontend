// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { OrderService } from '../../services/order.service';
// import { CustomerService, Customer } from '../../services/customer.service';
//
// @Component({
//   selector: 'app-order-upload',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './order-upload.html',
//   styleUrls: ['./order-upload.css']
// })
// export class OrderUploadComponent implements OnInit {
//   selectedFile: File | null = null;
//   uploadType: '24shop' | 'shopee' = '24shop';
//   autoDeductStock: boolean = true;
//   uploading: boolean = false;
//   previewMode: boolean = false;
//
//   // ข้อมูลสำหรับ 24Shop
//   orderNumber: string = '';
//   selectedCustomerId: number | null = null;
//   customers: Customer[] = [];
//   filteredCustomers: Customer[] = [];
//   searchCustomerTerm: string = '';
//   showCustomerDropdown: boolean = false;
//
//   uploadResult: any = null;
//   previewItems: any[] = [];        // สำหรับ 24Shop
//   previewOrders: any[] = [];       // สำหรับ Shopee
//   uploadMessages: string[] = [];
//
//   constructor(
//     private orderService: OrderService,
//     private customerService: CustomerService,
//     private router: Router
//   ) {}
//
//   ngOnInit(): void {
//     this.loadCustomers();
//   }
//
//   loadCustomers(): void {
//     this.customerService.getAllCustomers().subscribe({
//       next: (customers) => {
//         this.customers = customers;
//         this.filteredCustomers = customers;
//       },
//       error: (error) => console.error('Error loading customers:', error)
//     });
//   }
//
//   hideCustomerDropdown(): void {
//     setTimeout(() => {
//       this.showCustomerDropdown = false;
//     }, 200);
//   }
//
//   onCustomerSearch(): void {
//     if (this.searchCustomerTerm.trim()) {
//       this.filteredCustomers = this.customers.filter(c =>
//         c.customerName.toLowerCase().includes(this.searchCustomerTerm.toLowerCase()) ||
//         (c.customerPhone && c.customerPhone.includes(this.searchCustomerTerm))
//       );
//     } else {
//       this.filteredCustomers = this.customers;
//     }
//     this.showCustomerDropdown = this.filteredCustomers.length > 0;
//   }
//
//   selectCustomer(customer: Customer): void {
//     this.selectedCustomerId = customer.customerId!;
//     this.searchCustomerTerm = customer.customerName;
//     this.showCustomerDropdown = false;
//   }
//
//   onFileSelected(event: any): void {
//     const file = event.target.files[0];
//     if (file) {
//       this.selectedFile = file;
//       this.uploadResult = null;
//       this.previewItems = [];
//       this.previewOrders = [];
//       this.uploadMessages = [];
//     }
//   }
//
//   onDragOver(event: DragEvent): void {
//     event.preventDefault();
//     event.stopPropagation();
//   }
//
//   onDrop(event: DragEvent): void {
//     event.preventDefault();
//     event.stopPropagation();
//
//     if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
//       this.selectedFile = event.dataTransfer.files[0];
//       this.uploadResult = null;
//       this.previewItems = [];
//       this.previewOrders = [];
//     }
//   }
//
//   removeFile(): void {
//     this.selectedFile = null;
//     this.uploadResult = null;
//     this.previewItems = [];
//     this.previewOrders = [];
//     this.uploadMessages = [];
//   }
//
//   previewFile(): void {
//     if (!this.selectedFile) {
//       alert('กรุณาเลือกไฟล์');
//       return;
//     }
//
//     this.previewMode = true;
//     this.uploading = true;
//
//     if (this.uploadType === '24shop') {
//       // Preview PDF - แสดงเฉพาะรายการสินค้า
//       this.orderService.preview24ShopPDF(this.selectedFile).subscribe({
//         next: (response) => {
//           if (response.success) {
//             this.previewItems = response.items || [];
//             this.previewOrders = []; // เคลียร์ค่าเก่า
//             alert(`แสดงตัวอย่างสำเร็จ - พบ ${response.itemsCount} รายการ`);
//           } else {
//             alert('เกิดข้อผิดพลาด: ' + response.message);
//           }
//           this.uploading = false;
//         },
//         error: (error) => {
//           console.error('Error previewing file:', error);
//           alert('เกิดข้อผิดพลาดในการแสดงตัวอย่าง');
//           this.uploading = false;
//         }
//       });
//     } else {
//       // Preview Excel - แสดงออเดอร์ทั้งหมด
//       this.orderService.previewExcel(this.selectedFile).subscribe({
//         next: (response) => {
//           if (response.success) {
//             this.previewOrders = response.orders || [];
//             this.previewItems = []; // เคลียร์ค่าเก่า
//             alert(`แสดงตัวอย่างสำเร็จ - พบ ${this.previewOrders.length} ออเดอร์`);
//           } else {
//             alert('เกิดข้อผิดพลาด: ' + response.message);
//           }
//           this.uploading = false;
//         },
//         error: (error) => {
//           console.error('Error previewing file:', error);
//           alert('เกิดข้อผิดพลาดในการแสดงตัวอย่าง');
//           this.uploading = false;
//         }
//       });
//     }
//   }
//
//   uploadFile(): void {
//     if (this.uploadType === '24shop') {
//       this.upload24Shop();
//     } else {
//       this.uploadShopee();
//     }
//   }
//
//   upload24Shop(): void {
//     if (!this.validateUpload()) {
//       return;
//     }
//
//     this.previewMode = false;
//     this.uploading = true;
//     this.uploadMessages = [];
//
//     this.orderService.upload24ShopPDFWithCustomer(
//       this.selectedFile!,
//       this.orderNumber,
//       this.selectedCustomerId!,
//       this.autoDeductStock
//     ).subscribe({
//       next: (response) => {
//         this.uploadResult = response;
//
//         if (response.success) {
//           if (response.stockDeductionMessages) {
//             this.uploadMessages = response.stockDeductionMessages;
//           }
//
//           alert(`อัพโหลดสำเร็จ!\nเลขออเดอร์: ${response.orderNumber}\nจำนวนสินค้า: ${response.itemsCount} รายการ`);
//
//           setTimeout(() => {
//             this.router.navigate(['/orders']);
//           }, 2000);
//         } else {
//           alert('เกิดข้อผิดพลาด: ' + response.message);
//         }
//
//         this.uploading = false;
//       },
//       error: (error) => {
//         console.error('Error uploading file:', error);
//         alert('เกิดข้อผิดพลาดในการอัพโหลดไฟล์: ' + (error.error?.message || error.message));
//         this.uploading = false;
//       }
//     });
//   }
//
//   uploadShopee(): void {
//     if (!this.selectedFile) {
//       alert('กรุณาเลือกไฟล์');
//       return;
//     }
//
//     this.uploading = true;
//     this.uploadMessages = [];
//
//     this.orderService.uploadShopeeExcel(this.selectedFile, this.autoDeductStock).subscribe({
//       next: (response) => {
//         this.uploadResult = response;
//
//         if (response.success) {
//           if (response.stockDeductionMessages) {
//             this.uploadMessages = response.stockDeductionMessages;
//           }
//
//           alert(`อัพโหลดสำเร็จ!\n${response.message}`);
//
//           setTimeout(() => {
//             this.router.navigate(['/orders']);
//           }, 2000);
//         } else {
//           alert('เกิดข้อผิดพลาด: ' + response.message);
//         }
//
//         this.uploading = false;
//       },
//       error: (error) => {
//         console.error('Error uploading file:', error);
//         alert('เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
//         this.uploading = false;
//       }
//     });
//   }
//
//   validateUpload(): boolean {
//     if (!this.selectedFile) {
//       alert('กรุณาเลือกไฟล์');
//       return false;
//     }
//
//     if (this.uploadType === '24shop') {
//       if (!this.orderNumber.trim()) {
//         alert('กรุณาระบุเลขที่ออเดอร์ (PO Number)');
//         return false;
//       }
//
//       if (!this.selectedCustomerId) {
//         alert('กรุณาเลือกลูกค้า');
//         return false;
//       }
//
//       const fileName = this.selectedFile.name.toLowerCase();
//       if (!fileName.endsWith('.pdf')) {
//         alert('กรุณาเลือกไฟล์ PDF สำหรับ 24Shop');
//         return false;
//       }
//     }
//
//     return true;
//   }
//
//   getFileIcon(): string {
//     if (!this.selectedFile) return 'bi-file-earmark';
//
//     const fileName = this.selectedFile.name.toLowerCase();
//     if (fileName.endsWith('.pdf')) return 'bi-file-earmark-pdf';
//     if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return 'bi-file-earmark-excel';
//
//     return 'bi-file-earmark';
//   }
//
//   formatFileSize(bytes: number): string {
//     if (bytes < 1024) return bytes + ' B';
//     if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
//     return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
//   }
//
//   formatCurrency(amount: number): string {
//     return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//   }
//
//   goBack(): void {
//     this.router.navigate(['/orders']);
//   }
// }
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
  uploadType: '24shop' | 'shopee' = '24shop';
  autoDeductStock: boolean = true;
  uploading: boolean = false;
  previewMode: boolean = false;

  // ⭐ เพิ่ม flag สำหรับแสดงสถานะการใช้ Gemini AI
  isGeminiProcessing: boolean = false;
  geminiProgress: string = '';

  // ข้อมูลสำหรับ 24Shop
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

  // ⭐ เพิ่ม property สำหรับแสดงข้อมูล parsing
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
  }

  previewFile(): void {
    if (!this.selectedFile) {
      alert('กรุณาเลือกไฟล์');
      return;
    }

    this.previewMode = true;
    this.uploading = true;

    if (this.uploadType === '24shop') {
      // ⭐ แสดงสถานะว่ากำลังใช้ Gemini AI
      this.isGeminiProcessing = true;
      this.geminiProgress = 'กำลังวิเคราะห์ PDF ด้วย Gemini AI...';

      this.orderService.preview24ShopPDF(this.selectedFile).subscribe({
        next: (response) => {
          this.isGeminiProcessing = false;

          if (response.success) {
            this.previewItems = response.items || [];
            this.previewOrders = [];

            // ⭐ ตรวจสอบว่าใช้ Gemini หรือไม่
            if (response.parsedWith === 'Gemini AI') {
              this.parsingMethod = 'gemini';
              this.parsingAccuracy = this.calculateAccuracy(this.previewItems);
              this.geminiProgress = `✅ วิเคราะห์ด้วย Gemini AI สำเร็จ (${response.itemsCount} รายการ)`;
            } else {
              this.parsingMethod = 'traditional';
              this.geminiProgress = 'ใช้วิธีการแบบเดิม';
            }

            // แสดง notification ที่สวยงามขึ้น
            this.showSuccessNotification(
              `🤖 Gemini AI วิเคราะห์สำเร็จ`,
              `พบ ${response.itemsCount} รายการสินค้า | ความแม่นยำ: ${this.parsingAccuracy}%`
            );
          } else {
            alert('เกิดข้อผิดพลาด: ' + response.message);
          }
          this.uploading = false;
        },
        error: (error) => {
          console.error('Error previewing file:', error);
          this.isGeminiProcessing = false;
          this.geminiProgress = '❌ เกิดข้อผิดพลาดในการวิเคราะห์';
          alert('เกิดข้อผิดพลาดในการแสดงตัวอย่าง: ' + (error.error?.message || error.message));
          this.uploading = false;
        }
      });
    } else {
      // Shopee Excel - ไม่ใช้ Gemini
      this.orderService.previewExcel(this.selectedFile).subscribe({
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
          console.error('Error previewing file:', error);
          alert('เกิดข้อผิดพลาดในการแสดงตัวอย่าง');
          this.uploading = false;
        }
      });
    }
  }

  uploadFile(): void {
    if (this.uploadType === '24shop') {
      this.upload24Shop();
    } else {
      this.uploadShopee();
    }
  }

  upload24Shop(): void {
    if (!this.validateUpload()) {
      return;
    }

    this.previewMode = false;
    this.uploading = true;
    this.uploadMessages = [];

    // ⭐ แสดงสถานะ Gemini
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
          if (response.stockDeductionMessages) {
            this.uploadMessages = response.stockDeductionMessages;
          }

          // ⭐ แสดงข้อมูลเพิ่มเติมถ้าใช้ Gemini
          let successMessage = `อัพโหลดสำเร็จ!\nเลขออเดอร์: ${response.orderNumber}\nจำนวนสินค้า: ${response.itemsCount} รายการ`;

          if (response.parsedWith === 'Gemini AI') {
            successMessage += `\n\n🤖 ประมวลผลด้วย: Gemini AI\n✨ ความแม่นยำสูง: ${this.parsingAccuracy}%`;
            this.geminiProgress = '✅ Gemini AI ประมวลผลสำเร็จ';
          }

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
        console.error('Error uploading file:', error);
        this.isGeminiProcessing = false;
        this.geminiProgress = '❌ เกิดข้อผิดพลาด';
        alert('เกิดข้อผิดพลาดในการอัพโหลดไฟล์: ' + (error.error?.message || error.message));
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
          if (response.stockDeductionMessages) {
            this.uploadMessages = response.stockDeductionMessages;
          }

          alert(`อัพโหลดสำเร็จ!\n${response.message}`);

          setTimeout(() => {
            this.router.navigate(['/orders']);
          }, 2000);
        } else {
          alert('เกิดข้อผิดพลาด: ' + response.message);
        }

        this.uploading = false;
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        alert('เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
        this.uploading = false;
      }
    });
  }

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

    return true;
  }

  // ⭐ Helper Methods
  calculateAccuracy(items: any[]): number {
    if (!items || items.length === 0) return 0;

    // คำนวณความสมบูรณ์ของข้อมูล
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
    // สามารถใช้ toast library หรือ custom notification
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
