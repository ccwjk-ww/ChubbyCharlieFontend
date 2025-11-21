import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ThaiStockService, ThaiStock } from '../../services/thai-stock.service';
import { StockLotService, StockLot } from '../../services/stock-lot.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thai-stock-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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

      // ⭐ เพิ่ม buffer fields
      includeBuffer: [false],
      bufferPercentage: [0, [Validators.min(0), Validators.max(100)]],
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
      next: (lots) => {
        this.stockLots = lots;
      },
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

            // ⭐ เพิ่ม buffer
            includeBuffer: stock.includeBuffer || false,
            bufferPercentage: stock.bufferPercentage || 0,
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

        // ⭐ เพิ่ม buffer
        includeBuffer: formValue.includeBuffer || false,
        bufferPercentage: formValue.bufferPercentage || 0
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
      includeBuffer: false,
      bufferPercentage: 0
    });
  }

  goBack(): void {
    this.router.navigate(['/thai-stocks']);
  }

  // ============================================
  // ⭐ Computed Properties (Getters)
  // ============================================

  /**
   * Total Cost (ราคารวม + ค่าส่ง)
   */
  get totalCost(): number {
    const priceTotal = this.thaiStockForm.value.priceTotal || 0;
    const shippingCost = this.thaiStockForm.value.shippingCost || 0;
    return priceTotal + shippingCost;
  }

  /**
   * Price Per Unit (ราคาต่อหน่วย - ยังไม่รวมค่าส่ง)
   */
  get pricePerUnit(): number {
    const priceTotal = this.thaiStockForm.value.priceTotal || 0;
    const quantity = this.thaiStockForm.value.quantity || 1;
    return quantity > 0 ? priceTotal / quantity : 0;
  }

  /**
   * Average Shipping Per Unit (ค่าส่งเฉลี่ยต่อหน่วย)
   */
  get avgShippingPerUnit(): number {
    const shipping = this.thaiStockForm.value.shippingCost || 0;
    const quantity = this.thaiStockForm.value.quantity || 1;
    return quantity > 0 ? shipping / quantity : 0;
  }

  /**
   * Total With Buffer (รวม buffer ถ้ามี)
   */
  get totalWithBuffer(): number {
    const total = this.totalCost;
    const includeBuffer = this.thaiStockForm.value.includeBuffer;
    const bufferPercent = this.thaiStockForm.value.bufferPercentage || 0;

    if (includeBuffer && bufferPercent > 0) {
      return total * (1 + bufferPercent / 100);
    }
    return total;
  }

  /**
   * Final Price Per Unit (ราคาสุดท้ายต่อหน่วย รวมทุกอย่าง)
   */
  get pricePerUnitWithShipping(): number {
    const quantity = this.thaiStockForm.value.quantity || 1;
    return quantity > 0 ? this.totalWithBuffer / quantity : 0;
  }

  /**
   * ⭐ Format Number Helper (3 ทศนิยม + thousand separator)
   */
  formatNumber(num: number): string {
    if (num === null || num === undefined) return '0.000';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
  }
}
