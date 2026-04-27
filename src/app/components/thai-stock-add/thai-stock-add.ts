import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ThaiStockService, ThaiStock } from '../../services/thai-stock.service';
import { StockLotService, StockLot } from '../../services/stock-lot.service';
import { StockDocumentWidgetComponent } from '../stock-document-widget/stock-document-widget';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thai-stock-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, StockDocumentWidgetComponent],
  templateUrl: './thai-stock-add.html',
  styleUrls: ['./thai-stock-add.css']
})
export class ThaiStockAddComponent implements OnInit {
  thaiStockForm: FormGroup;
  isEditMode: boolean = false;
  stockItemId: number | null = null;
  stockLots: StockLot[] = [];

  constructor(
    private fb: FormBuilder,
    private thaiStockService: ThaiStockService,
    private stockLotService: StockLotService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.thaiStockForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      shopURL: [''],
      quantity: ['', [Validators.required, Validators.min(0)]],
      priceTotal: ['', [Validators.required, Validators.min(0)]],
      shippingCost: [0, [Validators.min(0)]],
      status: ['ACTIVE', Validators.required],
      stockLotId: [''],

      // ⭐ เปลี่ยนจาก includeBuffer/bufferPercentage เป็น includeVat/vatPercentage
      includeVat: [false],
      vatPercentage: [0, [Validators.min(0), Validators.max(100)]],
    });
  }

  ngOnInit(): void {
    this.stockItemId = this.route.snapshot.paramMap.get('id') ?
      Number(this.route.snapshot.paramMap.get('id')) : null;
    this.isEditMode = !!this.stockItemId;

    this.loadStockLots();

    if (this.isEditMode) {
      this.loadThaiStock();
    }
  }

  loadStockLots(): void {
    this.stockLotService.getAllStockLots().subscribe({
      next: (lots) => { this.stockLots = lots; },
      error: (error) => console.error('Error loading stock lots:', error)
    });
  }

  loadThaiStock(): void {
    if (this.stockItemId) {
      this.thaiStockService.getThaiStockById(this.stockItemId).subscribe({
        next: (stock) => {
          this.thaiStockForm.patchValue({
            name: stock.name,
            shopURL: stock.shopURL || '',
            quantity: stock.quantity,
            priceTotal: stock.priceTotal,
            shippingCost: stock.shippingCost || 0,
            status: stock.status || 'ACTIVE',
            stockLotId: stock.stockLotId || '',
            // ⭐ VAT fields
            includeVat: stock.includeVat || false,
            vatPercentage: stock.vatPercentage || 0,
          });
        },
        error: (error) => console.error('Error loading Thai stock:', error)
      });
    }
  }

  onSubmit(): void {
    if (this.thaiStockForm.valid) {
      const formValue = this.thaiStockForm.value;
      const thaiStock: ThaiStock = {
        name: formValue.name,
        shopURL: formValue.shopURL,
        quantity: formValue.quantity,
        priceTotal: formValue.priceTotal,
        shippingCost: formValue.shippingCost || 0,
        status: formValue.status,
        stockLotId: formValue.stockLotId,
        // ⭐ VAT fields
        includeVat: formValue.includeVat || false,
        vatPercentage: formValue.vatPercentage || 0
      };

      if (this.isEditMode && this.stockItemId) {
        this.thaiStockService.updateThaiStock(this.stockItemId, thaiStock).subscribe({
          next: () => {
            alert('✅ Thai stock updated successfully!');
            this.router.navigate(['/thai-stocks']);
          },
          error: (error) => {
            console.error('Error updating Thai stock:', error);
            alert('❌ Error updating Thai stock. Please try again.');
          }
        });
      } else {
        this.thaiStockService.createThaiStock(thaiStock).subscribe({
          next: () => {
            alert('✅ Thai stock added successfully!');
            this.resetForm();
            this.router.navigate(['/thai-stocks']);
          },
          error: (error) => {
            console.error('Error adding Thai stock:', error);
            alert('❌ Error adding Thai stock. Please try again.');
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.thaiStockForm.controls).forEach(key => {
      const control = this.thaiStockForm.get(key);
      control?.markAsTouched();
    });
  }

  private resetForm(): void {
    this.thaiStockForm.reset();
    this.thaiStockForm.patchValue({
      status: 'ACTIVE',
      shippingCost: 0,
      includeVat: false,
      vatPercentage: 0
    });
  }

  goBack(): void {
    this.router.navigate(['/thai-stocks']);
  }

  // ============================================
  // Computed Properties (Getters)
  // ============================================

  get totalCost(): number {
    const priceTotal = this.thaiStockForm.value.priceTotal || 0;
    const shippingCost = this.thaiStockForm.value.shippingCost || 0;
    return priceTotal + shippingCost;
  }

  get pricePerUnit(): number {
    const priceTotal = this.thaiStockForm.value.priceTotal || 0;
    const quantity = this.thaiStockForm.value.quantity || 1;
    return quantity > 0 ? priceTotal / quantity : 0;
  }

  get avgShippingPerUnit(): number {
    const shipping = this.thaiStockForm.value.shippingCost || 0;
    const quantity = this.thaiStockForm.value.quantity || 1;
    return quantity > 0 ? shipping / quantity : 0;
  }

  // ⭐ คำนวณ VAT amount
  get vatAmount(): number {
    const total = this.totalCost;
    const includeVat = this.thaiStockForm.value.includeVat;
    const vatPercent = this.thaiStockForm.value.vatPercentage || 0;
    if (includeVat && vatPercent > 0) {
      return total * (vatPercent / 100);
    }
    return 0;
  }

  // ⭐ ราคารวม VAT
  get totalWithVat(): number {
    return this.totalCost + this.vatAmount;
  }

  get pricePerUnitWithShipping(): number {
    const quantity = this.thaiStockForm.value.quantity || 1;
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
