import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChinaStockService, ChinaStock } from '../../services/china-stock.service';
import { StockLotService, StockLot } from '../../services/stock-lot.service';
import { StockDocumentWidgetComponent } from '../stock-document-widget/stock-document-widget';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-china-stock-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, StockDocumentWidgetComponent],
  templateUrl: './china-stock-add.html',
  styleUrls: ['./china-stock-add.css']
})
export class ChinaStockAddComponent implements OnInit {
  chinaStockForm: FormGroup;
  isEditMode: boolean = false;
  stockItemId: number | null = null;
  stockLots: StockLot[] = [];

  constructor(
    private fb: FormBuilder,
    private chinaStockService: ChinaStockService,
    private stockLotService: StockLotService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.chinaStockForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      shopURL: [''],
      unitPriceYuan: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      shippingWithinChinaYuan: [0, [Validators.min(0)]],
      exchangeRate: ['', [Validators.required, Validators.min(0.1)]],
      shippingChinaToThaiBath: [0, [Validators.min(0)]],

      // ⭐ เปลี่ยนจาก includeBuffer/bufferPercentage เป็น includeVat/vatPercentage
      includeVat: [false],
      vatPercentage: [0, [Validators.min(0), Validators.max(100)]],

      status: ['ACTIVE', Validators.required],
      stockLotId: ['']
    });
  }

  ngOnInit(): void {
    this.stockItemId = this.route.snapshot.paramMap.get('id') ?
      Number(this.route.snapshot.paramMap.get('id')) : null;
    this.isEditMode = !!this.stockItemId;

    this.loadStockLots();

    if (this.isEditMode) {
      this.loadChinaStock();
    }
  }

  loadStockLots(): void {
    this.stockLotService.getAllStockLots().subscribe({
      next: (lots) => { this.stockLots = lots; },
      error: (error) => console.error('Error loading stock lots:', error)
    });
  }

  loadChinaStock(): void {
    if (this.stockItemId) {
      this.chinaStockService.getChinaStockById(this.stockItemId).subscribe({
        next: (stock) => {
          this.chinaStockForm.patchValue({
            name: stock.name,
            shopURL: stock.shopURL || '',
            // ⭐ แก้: ใช้ originalQuantity แทน quantity
            quantity: stock.originalQuantity || stock.currentQuantity || stock.quantity,
            unitPriceYuan: stock.unitPriceYuan,
            shippingWithinChinaYuan: stock.shippingWithinChinaYuan || 0,
            exchangeRate: stock.exchangeRate,
            shippingChinaToThaiBath: stock.shippingChinaToThaiBath || 0,
            includeVat: stock.includeVat || false,
            vatPercentage: stock.vatPercentage || 0,
            status: stock.status || 'ACTIVE',
            stockLotId: stock.stockLotId || ''
          });
        },
        error: (error) => console.error('Error loading China stock:', error)
      });
    }
  }

  onSubmit(): void {
    if (this.chinaStockForm.valid) {
      const formValue = this.chinaStockForm.value;
      const chinaStock: ChinaStock = {
        name: formValue.name,
        shopURL: formValue.shopURL,
        unitPriceYuan: formValue.unitPriceYuan,
        quantity: formValue.quantity,
        shippingWithinChinaYuan: formValue.shippingWithinChinaYuan || 0,
        exchangeRate: formValue.exchangeRate,
        shippingChinaToThaiBath: formValue.shippingChinaToThaiBath || 0,
        // ⭐ VAT fields
        includeVat: formValue.includeVat || false,
        vatPercentage: formValue.vatPercentage || 0,
        status: formValue.status,
        stockLotId: formValue.stockLotId
      };

      if (this.isEditMode && this.stockItemId) {
        this.chinaStockService.updateChinaStock(this.stockItemId, chinaStock).subscribe({
          next: () => {
            alert('✅ China stock updated successfully!');
            this.router.navigate(['/china-stocks']);
          },
          error: (error) => {
            console.error('Error updating China stock:', error);
            alert('❌ Error updating China stock. Please try again.');
          }
        });
      } else {
        this.chinaStockService.createChinaStock(chinaStock).subscribe({
          next: () => {
            alert('✅ China stock added successfully!');
            this.resetForm();
            this.router.navigate(['/china-stocks']);
          },
          error: (error) => {
            console.error('Error adding China stock:', error);
            alert('❌ Error adding China stock. Please try again.');
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.chinaStockForm.controls).forEach(key => {
      const control = this.chinaStockForm.get(key);
      control?.markAsTouched();
    });
  }

  private resetForm(): void {
    this.chinaStockForm.reset();
    this.chinaStockForm.patchValue({
      status: 'ACTIVE',
      shippingWithinChinaYuan: 0,
      shippingChinaToThaiBath: 0,
      includeVat: false,
      vatPercentage: 0
    });
  }

  goBack(): void {
    this.router.navigate(['/china-stocks']);
  }

  // ============================================
  // Computed Properties (Getters)
  // ============================================

  get avgShippingPerPair(): number {
    const shipping = this.chinaStockForm.value.shippingChinaToThaiBath || 0;
    const quantity = this.chinaStockForm.value.quantity || 1;
    return quantity > 0 ? shipping / quantity : 0;
  }

  get totalValueYuan(): number {
    const unitPrice = this.chinaStockForm.value.unitPriceYuan || 0;
    const quantity = this.chinaStockForm.value.quantity || 0;
    return unitPrice * quantity;
  }

  get totalYuan(): number {
    const totalValue = this.totalValueYuan;
    const shipping = this.chinaStockForm.value.shippingWithinChinaYuan || 0;
    return totalValue + shipping;
  }

  get totalBath(): number {
    const totalYuan = this.totalYuan;
    const exchangeRate = this.chinaStockForm.value.exchangeRate || 0;
    return totalYuan * exchangeRate;
  }

  get totalWithShipping(): number {
    const totalBath = this.totalBath;
    const shipping = this.chinaStockForm.value.shippingChinaToThaiBath || 0;
    return totalBath + shipping;
  }

  // ⭐ คำนวณ VAT amount
  get vatAmount(): number {
    const total = this.totalWithShipping;
    const includeVat = this.chinaStockForm.value.includeVat;
    const vatPercent = this.chinaStockForm.value.vatPercentage || 0;
    if (includeVat && vatPercent > 0) {
      return total * (vatPercent / 100);
    }
    return 0;
  }

  // ⭐ ราคารวม VAT
  get totalWithVat(): number {
    return this.totalWithShipping + this.vatAmount;
  }

  get finalPricePerPair(): number {
    const quantity = this.chinaStockForm.value.quantity || 1;
    return quantity > 0 ? this.totalWithVat / quantity : 0;
  }

  formatNumber(num: number): string {
    if (num === null || num === undefined) return '0.000';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
  }
}
