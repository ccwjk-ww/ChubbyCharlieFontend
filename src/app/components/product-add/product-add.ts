import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService, Product, ProductCreateRequest, ProductIngredientRequest, StockOption } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './product-add.html',
  styleUrl: './product-add.css'
})
export class ProductAddComponent implements OnInit {
  productForm: FormGroup;
  isEditMode: boolean = false;
  productId: number | null = null;
  loading: boolean = false;

  // ⭐ เพิ่ม: สำหรับจัดการรูปภาพ
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  currentImageUrl: string | null = null;

  // Options for dropdowns
  stockOptions: StockOption[] = [];
  categories: string[] = ['ถุงเท้า', 'อุปกรณ์', 'บรรจุภัณฑ์', 'อื่นๆ'];

  // Units
  commonUnits: string[] = ['คู่', 'ชิ้น', 'อัน', 'ใบ'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      sku: ['', [Validators.required, Validators.minLength(2)]],
      category: [''],
      sellingPrice: ['', [Validators.required, Validators.min(0)]],
      status: ['ACTIVE', Validators.required],
      ingredients: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    this.isEditMode = !!this.productId;

    this.loadStockOptions();

    if (this.isEditMode) {
      this.loadProduct();
    } else {
      this.addIngredient();
    }
  }

  get ingredientsArray(): FormArray {
    return this.productForm.get('ingredients') as FormArray;
  }

  loadStockOptions(): void {
    this.productService.getAvailableStockItems().subscribe({
      next: (options) => {
        this.stockOptions = options.filter(opt => opt.status === 'ACTIVE');
      },
      error: (error) => console.error('Error loading stock options:', error)
    });
  }

  loadProduct(): void {
    if (this.productId) {
      this.loading = true;
      this.productService.getProductById(this.productId).subscribe({
        next: (product) => {
          this.productForm.patchValue({
            productName: product.productName,
            description: product.description,
            sku: product.sku,
            category: product.category,
            sellingPrice: product.sellingPrice,
            status: product.status || 'ACTIVE'
          });

          // ⭐ โหลดรูปภาพปัจจุบัน
          if (product.imageUrl) {
            this.currentImageUrl = product.imageUrl;
            this.imagePreview = product.imageUrl;
          }

          if (product.ingredients && product.ingredients.length > 0) {
            product.ingredients.forEach(ingredient => {
              this.addIngredientFromData(ingredient);
            });
          } else {
            this.addIngredient();
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.loading = false;
        }
      });
    }
  }

  /**
   * ⭐ จัดการเมื่อเลือกไฟล์รูปภาพ
   */
  onFileSelect(event: any): void {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      alert('กรุณาเลือกไฟล์ jpg, jpeg หรือ png เท่านั้น');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('ไฟล์ใหญ่เกิน 10MB');
      return;
    }

    // เก็บไฟล์และแสดง preview
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * ⭐ ลบรูปภาพที่เลือก
   */
  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = this.currentImageUrl; // กลับไปใช้รูปเดิม (ถ้ามี)
  }

  createIngredientFormGroup(data?: any): FormGroup {
    return this.fb.group({
      ingredientName: [data?.ingredientName || '', Validators.required],
      stockItemId: [data?.stockItemId || ''],
      requiredQuantity: [data?.requiredQuantity || '', [Validators.required, Validators.min(0.01)]],
      unit: [data?.unit || '', Validators.required],
      notes: [data?.notes || '']
    });
  }

  addIngredient(): void {
    this.ingredientsArray.push(this.createIngredientFormGroup());
  }

  addIngredientFromData(ingredientData: any): void {
    this.ingredientsArray.push(this.createIngredientFormGroup(ingredientData));
  }

  removeIngredient(index: number): void {
    if (this.ingredientsArray.length > 1) {
      this.ingredientsArray.removeAt(index);
    }
  }

  onStockItemChange(index: number, stockItemId: string): void {
    if (stockItemId) {
      const selectedStock = this.stockOptions.find(opt => opt.stockItemId.toString() === stockItemId);
      if (selectedStock) {
        const ingredient = this.ingredientsArray.at(index);
        if (!ingredient.get('ingredientName')?.value) {
          ingredient.patchValue({
            ingredientName: selectedStock.name
          });
        }
      }
    }
  }

  onSubmit(): void {
    if (this.productForm.valid && this.ingredientsArray.length > 0) {
      this.loading = true;
      const formValue = this.productForm.value;

      // ⭐ สร้าง ingredients สำหรับทั้ง Create และ Update
      const ingredients: ProductIngredientRequest[] = formValue.ingredients.map((ing: any) => ({
        stockItemId: ing.stockItemId ? parseInt(ing.stockItemId) : undefined,
        ingredientName: ing.ingredientName,
        requiredQuantity: parseFloat(ing.requiredQuantity),
        unit: ing.unit,
        notes: ing.notes
      }));

      // สร้าง request object
      const request: ProductCreateRequest = {
        productName: formValue.productName,
        description: formValue.description,
        sku: formValue.sku,
        category: formValue.category,
        sellingPrice: parseFloat(formValue.sellingPrice),
        ingredients: ingredients
      };

      if (this.isEditMode && this.productId) {
        // ============================================
        // UPDATE MODE - ใช้ updateProductWithIngredients
        // ============================================
        console.log('🔄 Update Mode - Product ID:', this.productId);
        console.log('📤 Sending update data:', request);
        console.log('🖼️ Selected file:', this.selectedFile ? this.selectedFile.name : 'None');
        console.log('📊 Status from form:', formValue.status); // ⭐ ตรวจสอบสถานะ

        this.productService.updateProductWithIngredients(
          this.productId,
          request,
          this.selectedFile || undefined,
          formValue.status
        ).subscribe({
          next: (response) => {
            console.log('✅ Update response:', response);
            alert('อัปเดตสินค้าสำเร็จ!');
            this.router.navigate(['/products']);
          },
          error: (error) => {
            console.error('❌ Error updating product:', error);
            console.error('Error details:', {
              status: error.status,
              message: error.message,
              error: error.error
            });
            alert('เกิดข้อผิดพลาดในการอัปเดตสินค้า: ' + (error.error?.message || error.message));
            this.loading = false;
          }
        });

      } else {
        // ============================================
        // CREATE MODE
        // ============================================
        console.log('➕ Create Mode');
        console.log('📤 Sending create request:', request);
        console.log('🖼️ Selected file:', this.selectedFile ? this.selectedFile.name : 'None');

        this.productService.createProduct(
          request,
          this.selectedFile || undefined
        ).subscribe({
          next: (createdProduct) => {
            console.log('✅ Create response:', createdProduct);

            if (createdProduct.isUsingDefaultImage) {
              alert('สร้างสินค้าสำเร็จ! (ใช้รูป Default)');
            } else {
              alert('สร้างสินค้าสำเร็จ!');
            }

            this.router.navigate(['/products']);
          },
          error: (error) => {
            console.error('❌ Error creating product:', error);
            console.error('Error details:', {
              status: error.status,
              message: error.message,
              error: error.error
            });
            alert('เกิดข้อผิดพลาดในการสร้างสินค้า: ' + (error.error?.message || error.message));
            this.loading = false;
          }
        });
      }
    } else {
      console.warn('⚠️ Form is invalid or has no ingredients');
      if (!this.productForm.valid) {
        console.warn('Invalid fields:', Object.keys(this.productForm.controls)
          .filter(key => this.productForm.get(key)?.invalid));
      }
      if (this.ingredientsArray.length === 0) {
        console.warn('No ingredients added');
      }
    }
  }

  calculateEstimatedCost(): number {
    let totalCost = 0;

    this.ingredientsArray.controls.forEach(control => {
      const stockItemId = control.get('stockItemId')?.value;
      const requiredQuantity = parseFloat(control.get('requiredQuantity')?.value || '0');

      if (stockItemId && requiredQuantity > 0) {
        const stockOption = this.stockOptions.find(opt => opt.stockItemId.toString() === stockItemId);
        if (stockOption) {
          totalCost += stockOption.unitCost * requiredQuantity;
        }
      }
    });

    return totalCost;
  }

  calculateEstimatedProfit(): number {
    const sellingPrice = parseFloat(this.productForm.get('sellingPrice')?.value || '0');
    const estimatedCost = this.calculateEstimatedCost();
    return sellingPrice - estimatedCost;
  }

  calculateProfitMargin(): number {
    const sellingPrice = parseFloat(this.productForm.get('sellingPrice')?.value || '0');
    const profit = this.calculateEstimatedProfit();
    return sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  }

  getStockOptionDisplay(stockOption: StockOption): string {
    const lotInfo = stockOption.lotName ? ` [${stockOption.lotName}]` : '';
    return `${stockOption.name}${lotInfo} (${stockOption.type}) - ฿${stockOption.unitCost.toFixed(3)}`;
  }

  isFormValid(): boolean {
    return this.productForm.valid && this.ingredientsArray.length > 0;
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
