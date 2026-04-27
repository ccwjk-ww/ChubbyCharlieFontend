import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService, Product, ProductCreateRequest, ProductIngredientRequest, StockOption } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MultiLotIngredientComponent } from '../multi-lot-ingredient/multi-lot-ingredient';
@Component({
  selector: 'app-product-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MultiLotIngredientComponent],
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

  // ⭐ แก้ไข: loadProduct - เพิ่ม logging
  loadProduct(): void {
    if (this.productId) {
      this.loading = true;
      this.productService.getProductById(this.productId).subscribe({
        next: (product) => {
          console.log('📦 Loaded product:', product);

          this.productForm.patchValue({
            productName: product.productName,
            description: product.description,
            sku: product.sku,
            category: product.category,
            sellingPrice: product.sellingPrice,
            status: product.status || 'ACTIVE'
          });

          if (product.imageUrl) {
            this.currentImageUrl = product.imageUrl;
            this.imagePreview = product.imageUrl;
          }

          if (product.ingredients && product.ingredients.length > 0) {
            console.log('🔍 Loading ingredients:', product.ingredients);

            product.ingredients.forEach((ingredient, index) => {
              console.log(`  📌 Ingredient #${index + 1}:`, ingredient);

              // ⭐ Log allocations
              if (ingredient.stockAllocations) {
                console.log(`    💰 Allocations:`, ingredient.stockAllocations);
                ingredient.stockAllocations.forEach((alloc: any, allocIndex: number) => {
                  console.log(`      - Allocation #${allocIndex + 1}:`, {
                    stockItemId: alloc.stockItemId,
                    quantity: alloc.allocatedQuantity,
                    costPerUnit: alloc.costPerUnit,
                    totalCost: alloc.totalCost
                  });
                });
              }

              this.addIngredientFromData(ingredient);
            });
          } else {
            this.addIngredient();
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error loading product:', error);
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
    const group = this.fb.group({
      ingredientName: [data?.ingredientName || '', Validators.required],
      stockItemId: [data?.stockItemId || ''],
      requiredQuantity: [data?.requiredQuantity || '', [Validators.required, Validators.min(0.01)]],
      unit: [data?.unit || '', Validators.required],
      notes: [data?.notes || ''],

      // ⭐ NEW: Multi-Lot fields
      allocationMode: [data?.allocationMode || 'SINGLE'],
      stockAllocations: this.fb.array([])
    });

    // ⭐ ถ้ามี allocations ให้เพิ่มเข้าไป
    if (data?.stockAllocations && data.stockAllocations.length > 0) {
      const allocationsArray = group.get('stockAllocations') as FormArray;
      data.stockAllocations.forEach((alloc: any) => {
        allocationsArray.push(this.createAllocationFormGroup(alloc));
      });
    }

    return group;
  }

  // ⭐ NEW: สร้าง allocation form group
  // ⭐ แก้ไข: createAllocationFormGroup
  createAllocationFormGroup(data?: any): FormGroup {
    console.log('🔧 Creating allocation form group with data:', data);

    return this.fb.group({
      stockItemId: [data?.stockItemId || '', Validators.required],
      allocatedQuantity: [data?.allocatedQuantity || '', [Validators.required, Validators.min(0.01)]],
      allocationPriority: [data?.allocationPriority || 1, [Validators.required, Validators.min(1)]],

      // ⭐ เพิ่ม: สำหรับแสดงผลในหน้า Edit
      stockItemName: [data?.stockItemName || ''],
      unitCost: [data?.costPerUnit || 0],  // ⭐ สำคัญ: map จาก costPerUnit
      totalCost: [data?.totalCost || 0],   // ⭐ สำคัญ: map จาก totalCost
      lotName: [data?.lotName || ''],
      availableQuantity: [data?.availableQuantity || 0],
      stockType: [data?.stockType || '']   // ⭐ เพิ่ม stockType
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



  onSubmit(): void {
    if (this.productForm.valid && this.ingredientsArray.length > 0) {
      this.loading = true;
      const formValue = this.productForm.value;

      // ⭐ ปรับปรุงการสร้าง ingredients
      const ingredients: ProductIngredientRequest[] = formValue.ingredients.map((ing: any) => {
        const ingredient: ProductIngredientRequest = {
          ingredientName: ing.ingredientName,
          requiredQuantity: parseFloat(ing.requiredQuantity),
          unit: ing.unit,
          notes: ing.notes || null,
          allocationMode: ing.allocationMode || 'SINGLE'
        };

        // ⭐ ถ้าเป็น SINGLE mode
        if (ingredient.allocationMode === 'SINGLE') {
          // ตรวจสอบว่ามี stockItemId หรือไม่
          if (ing.stockItemId && ing.stockItemId !== '' && ing.stockItemId !== null) {
            ingredient.stockItemId = parseInt(ing.stockItemId);
          } else {
            // ⭐ ถ้าไม่มี ให้ set เป็น undefined (จะไม่ส่งไปใน JSON)
            ingredient.stockItemId = undefined;
          }

          // ⭐ ห้ามส่ง stockAllocations ใน SINGLE mode
          ingredient.stockAllocations = undefined;
        }

        // ⭐ ถ้าเป็น MULTI_LOT mode
        if (ingredient.allocationMode === 'MULTI_LOT') {
          // ⭐ ห้ามส่ง stockItemId ใน MULTI_LOT mode
          ingredient.stockItemId = undefined;

          // ตรวจสอบว่ามี allocations หรือไม่
          if (ing.stockAllocations && ing.stockAllocations.length > 0) {
            ingredient.stockAllocations = ing.stockAllocations
              .filter((alloc: any) => alloc.stockItemId && alloc.stockItemId !== '')
              .map((alloc: any) => ({
                stockItemId: parseInt(alloc.stockItemId),
                allocatedQuantity: parseFloat(alloc.allocatedQuantity),
                allocationPriority: parseInt(alloc.allocationPriority)
              }));
          } else {
            // ถ้าไม่มี allocations ให้เป็น array ว่าง
            ingredient.stockAllocations = [];
          }
        }

        return ingredient;
      });

      console.log('📤 Prepared ingredients:', ingredients);

      const request: ProductCreateRequest = {
        productName: formValue.productName,
        description: formValue.description,
        sku: formValue.sku,
        category: formValue.category,
        sellingPrice: parseFloat(formValue.sellingPrice),
        ingredients: ingredients,
        status: formValue.status
      };

      console.log('📤 Final request:', request);

      if (this.isEditMode && this.productId) {
        // UPDATE MODE
        console.log('🔄 Update Mode - Product ID:', this.productId);

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
            alert('เกิดข้อผิดพลาดในการอัปเดตสินค้า: ' + (error.error?.message || error.message));
            this.loading = false;
          }
        });

      } else {
        // CREATE MODE
        console.log('➕ Create Mode');

        this.productService.createProduct(
          request,
          this.selectedFile || undefined
        ).subscribe({
          next: (createdProduct) => {
            console.log('✅ Create response:', createdProduct);
            alert('สร้างสินค้าสำเร็จ!');
            this.router.navigate(['/products']);
          },
          error: (error) => {
            console.error('❌ Error creating product:', error);
            alert('เกิดข้อผิดพลาดในการสร้างสินค้า: ' + (error.error?.message || error.message));
            this.loading = false;
          }
        });
      }
    } else {
      console.warn('⚠️ Form is invalid or has no ingredients');

      // ⭐ แสดงรายละเอียด validation errors
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control?.invalid) {
          console.warn(`❌ Invalid field: ${key}`, control.errors);
        }
      });

      // ตรวจสอบ ingredients
      this.ingredientsArray.controls.forEach((ingredient, index) => {
        if (ingredient.invalid) {
          console.warn(`❌ Invalid ingredient #${index + 1}:`, ingredient.errors);
          Object.keys((ingredient as FormGroup).controls).forEach(field => {
            const fieldControl = ingredient.get(field);
            if (fieldControl?.invalid) {
              console.warn(`  - ${field}:`, fieldControl.errors);
            }
          });
        }
      });

      alert('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
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
  // ⭐ แก้ไข onStockItemChange ให้รองรับ Single Mode
  onStockItemChange(index: number, stockItemId: string): void {
    if (stockItemId) {
      const selectedStock = this.stockOptions.find(opt => opt.stockItemId.toString() === stockItemId);
      if (selectedStock) {
        const ingredient = this.ingredientsArray.at(index);

        // Auto-fill ingredient name ถ้ายังไม่มี
        if (!ingredient.get('ingredientName')?.value) {
          ingredient.patchValue({
            ingredientName: selectedStock.name
          });
        }

        // Auto-select unit (คู่) ถ้ายังไม่มี
        if (!ingredient.get('unit')?.value) {
          ingredient.patchValue({
            unit: 'คู่'
          });
        }
      }
    }
  }
}
