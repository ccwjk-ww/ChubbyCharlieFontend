// // multi-lot-ingredient.component.ts
// import {Component, Input, Output, EventEmitter, OnInit, OnChanges} from '@angular/core';
// import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ProductService, StockOption, ProductIngredientAllocation } from '../../services/product.service';
//
// @Component({
//   selector: 'app-multi-lot-ingredient',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule],
//   templateUrl: './multi-lot-ingredient.html',
//   styleUrl: './multi-lot-ingredient.css'
// })
// // multi-lot-ingredient.component.ts
//
// export class MultiLotIngredientComponent implements OnInit, OnChanges {
//   @Input() ingredientIndex!: number;
//   @Input() ingredientForm!: FormGroup;
//   @Input() stockOptions: StockOption[] = [];
//   @Output() remove = new EventEmitter<void>();
//
//   allocationMode: 'SINGLE' | 'MULTI_LOT' = 'SINGLE';
//   searchTerm: string = '';
//   filteredStocks: StockOption[] = [];
//   totalAllocated: number = 0;
//
//   // ⭐ เพิ่ม common units
//   commonUnits: string[] = ['คู่', 'ชิ้น', 'อัน', 'ใบ'];
//
//   constructor(
//     private fb: FormBuilder,
//     private productService: ProductService
//   ) {}
//
//   ngOnInit(): void {
//     console.log('📦 Stock Options received:', this.stockOptions);
//     this.filteredStocks = [...this.stockOptions];
//
//     // ตรวจสอบโหมดจากฟอร์ม
//     const mode = this.ingredientForm.get('allocationMode')?.value;
//     this.allocationMode = mode || 'SINGLE';
//
//     console.log('🎯 Allocation Mode:', this.allocationMode);
//
//     // สร้าง allocations array ถ้ายังไม่มี
//     if (!this.ingredientForm.get('stockAllocations')) {
//       this.ingredientForm.addControl('stockAllocations', this.fb.array([]));
//     }
//
//     // ⭐ แสดง allocations ที่มีอยู่แล้ว (Edit Mode)
//     const allocations = this.ingredientForm.get('stockAllocations') as FormArray;
//     if (allocations && allocations.length > 0) {
//       console.log('📋 Existing allocations:', allocations.length);
//
//       allocations.controls.forEach((allocation, index) => {
//         const allocationValue = allocation.value;
//         console.log(`  💰 Allocation #${index + 1}:`, {
//           stockItemId: allocationValue.stockItemId,
//           quantity: allocationValue.allocatedQuantity,
//           unitCost: allocationValue.unitCost,
//           totalCost: allocationValue.totalCost
//         });
//       });
//     }
//
//     // คำนวณ total allocated
//     this.calculateTotalAllocated();
//   }
//
//   // ⭐ เพิ่ม ngOnChanges เพื่อตรวจสอบการเปลี่ยนแปลงของ stockOptions
//   ngOnChanges(changes: any): void {
//     if (changes.stockOptions && changes.stockOptions.currentValue) {
//       console.log('📦 Stock Options updated:', changes.stockOptions.currentValue);
//       this.filteredStocks = [...changes.stockOptions.currentValue];
//     }
//   }
//
//   get allocationsArray(): FormArray {
//     return this.ingredientForm.get('stockAllocations') as FormArray;
//   }
//
//   /**
//    * ⭐ สลับโหมด SINGLE ↔ MULTI_LOT
//    */
//   toggleAllocationMode(): void {
//     if (this.allocationMode === 'SINGLE') {
//       // เปลี่ยนเป็น MULTI_LOT
//       this.allocationMode = 'MULTI_LOT';
//       this.ingredientForm.patchValue({ allocationMode: 'MULTI_LOT' });
//
//       // ถ้ามี stockItemId เดิม ให้สร้าง allocation แรก
//       const stockItemId = this.ingredientForm.get('stockItemId')?.value;
//       const requiredQty = this.ingredientForm.get('requiredQuantity')?.value;
//
//       if (stockItemId && requiredQty) {
//         this.addAllocationFromSingle(Number(stockItemId), Number(requiredQty));
//       } else {
//         this.addAllocation();
//       }
//
//       // ⭐ ล้าง stockItemId (set เป็น null แทน empty string)
//       this.ingredientForm.patchValue({ stockItemId: null });
//
//     } else {
//       // เปลี่ยนกลับเป็น SINGLE
//       this.allocationMode = 'SINGLE';
//       this.ingredientForm.patchValue({ allocationMode: 'SINGLE' });
//
//       // ลบ allocations ทั้งหมด
//       this.allocationsArray.clear();
//
//       // ⭐ ล้าง stockItemId
//       this.ingredientForm.patchValue({ stockItemId: null });
//     }
//   }
//
//   /**
//    * ⭐ สร้าง allocation จาก single stock
//    */
//   private addAllocationFromSingle(stockItemId: number, quantity: number): void {
//     const stock = this.stockOptions.find(s => s.stockItemId === stockItemId);
//
//     console.log('🔄 Converting Single to Multi-Lot:', { stockItemId, quantity, stock });
//
//     const allocationGroup = this.fb.group({
//       stockItemId: [stockItemId, Validators.required],
//       allocatedQuantity: [quantity, [Validators.required, Validators.min(0.01)]],
//       allocationPriority: [1, [Validators.required, Validators.min(1)]],
//       stockItemName: [stock?.name || ''],
//       unitCost: [stock?.unitCost || 0],
//       lotName: [stock?.lotName || ''],
//       availableQuantity: [stock?.availableQuantity || 0]
//     });
//
//     this.allocationsArray.push(allocationGroup);
//     this.calculateTotalAllocated();
//   }
//
//   /**
//    * ⭐ เพิ่ม allocation ใหม่ - ปรับปรุง
//    */
//   addAllocation(): void {
//     const nextPriority = this.allocationsArray.length + 1;
//
//     const allocationGroup = this.fb.group({
//       stockItemId: ['', Validators.required],
//       allocatedQuantity: ['', [Validators.required, Validators.min(0.01)]],
//       allocationPriority: [nextPriority, [Validators.required, Validators.min(1)]],
//       stockItemName: [''],
//       unitCost: [0],              // ⭐ เพิ่ม
//       totalCost: [0],             // ⭐ เพิ่ม
//       lotName: [''],
//       availableQuantity: [0],
//       stockType: ['']             // ⭐ เพิ่ม
//     });
//
//     this.allocationsArray.push(allocationGroup);
//     console.log('➕ Added new allocation, total:', this.allocationsArray.length);
//   }
//
//   /**
//    * ⭐ ลบ allocation
//    */
//   removeAllocation(index: number): void {
//     this.allocationsArray.removeAt(index);
//     this.reorderPriorities();
//     this.calculateTotalAllocated();
//   }
//
//   /**
//    * ⭐ จัดลำดับ priority ใหม่
//    */
//   private reorderPriorities(): void {
//     this.allocationsArray.controls.forEach((control, index) => {
//       control.patchValue({ allocationPriority: index + 1 });
//     });
//   }
//
//   /**
//    * ⭐ คำนวณยอดรวมที่จัดสรร
//    */
//   calculateTotalAllocated(): void {
//     this.totalAllocated = this.allocationsArray.controls.reduce((sum, control) => {
//       const qty = parseFloat(control.get('allocatedQuantity')?.value || '0');
//       return sum + qty;
//     }, 0);
//   }
//
//   /**
//    * ⭐ ตรวจสอบว่าจัดสรรครบหรือยัง
//    */
//   isFullyAllocated(): boolean {
//     const required = parseFloat(this.ingredientForm.get('requiredQuantity')?.value || '0');
//     return Math.abs(this.totalAllocated - required) < 0.0001;
//   }
//
//   /**
//    * ⭐ คำนวณยอดที่ยังไม่ได้จัดสรร
//    */
//   getRemainingQuantity(): number {
//     const required = parseFloat(this.ingredientForm.get('requiredQuantity')?.value || '0');
//     return Math.max(0, required - this.totalAllocated);
//   }
//
//
//   /**
//    * ⭐ เมื่อเลือก stock ใน allocation - ปรับปรุง
//    */
//   onAllocationStockChange(index: number, stockItemId: string): void {
//     console.log('📦 Allocation stock changed:', { index, stockItemId });
//
//     if (!stockItemId) {
//       // ⭐ ล้างข้อมูลถ้าไม่ได้เลือก
//       const allocation = this.allocationsArray.at(index);
//       allocation.patchValue({
//         stockItemName: '',
//         unitCost: 0,
//         lotName: '',
//         availableQuantity: 0,
//         stockType: ''
//       });
//       return;
//     }
//
//     const stock = this.stockOptions.find(s => s.stockItemId.toString() === stockItemId);
//
//     console.log('🔍 Found stock:', stock);
//
//     if (stock) {
//       const allocation = this.allocationsArray.at(index);
//
//       // ⭐ อัปเดตข้อมูลทั้งหมด
//       allocation.patchValue({
//         stockItemName: stock.name,
//         unitCost: stock.unitCost,        // ⭐ สำคัญ
//         lotName: stock.lotName,
//         availableQuantity: stock.availableQuantity,
//         stockType: stock.type
//       });
//
//       console.log('✅ Updated allocation with:', {
//         stockItemName: stock.name,
//         unitCost: stock.unitCost,
//         lotName: stock.lotName
//       });
//
//       // Auto-fill ingredient name ถ้ายังไม่มี (เฉพาะ allocation แรก)
//       if (index === 0) {
//         const currentIngredientName = this.ingredientForm.get('ingredientName')?.value;
//         if (!currentIngredientName || currentIngredientName.trim() === '') {
//           this.ingredientForm.patchValue({
//             ingredientName: stock.name
//           });
//         }
//
//         const currentUnit = this.ingredientForm.get('unit')?.value;
//         if (!currentUnit || currentUnit.trim() === '') {
//           this.ingredientForm.patchValue({
//             unit: 'คู่'
//           });
//         }
//       }
//     }
//
//     this.calculateTotalAllocated();
//   }
//
//   /**
//    * ⭐ เมื่อเลือก stock ใน Single Mode
//    */
//   onSingleStockChange(stockItemId: string): void {
//     console.log('📦 Single stock changed:', stockItemId);
//
//     if (!stockItemId) {
//       // ⭐ ถ้าไม่ได้เลือก ให้ clear ข้อมูล
//       this.ingredientForm.patchValue({
//         stockItemId: null
//       });
//       return;
//     }
//
//     const stock = this.stockOptions.find(s => s.stockItemId.toString() === stockItemId);
//
//     if (stock) {
//       // ⭐ Auto-fill ingredient name
//       const currentIngredientName = this.ingredientForm.get('ingredientName')?.value;
//       if (!currentIngredientName || currentIngredientName.trim() === '') {
//         this.ingredientForm.patchValue({
//           ingredientName: stock.name
//         });
//       }
//
//       // ⭐ Auto-select unit (คู่)
//       const currentUnit = this.ingredientForm.get('unit')?.value;
//       if (!currentUnit || currentUnit.trim() === '') {
//         this.ingredientForm.patchValue({
//           unit: 'คู่'
//         });
//       }
//     }
//   }
//
//   /**
//    * ⭐ คำนวณต้นทุนของ allocation
//    */
//   /**
//    * ⭐ คำนวณต้นทุนของ allocation - ปรับปรุงให้รองรับทั้ง Create และ Edit Mode
//    */
//   getAllocationCost(index: number): number {
//     const allocation = this.allocationsArray.at(index);
//     const qty = parseFloat(allocation.get('allocatedQuantity')?.value || '0');
//
//     // ⭐ ใช้ unitCost ที่มีอยู่แล้ว (สำหรับ Edit Mode)
//     let cost = parseFloat(allocation.get('unitCost')?.value || '0');
//
//     // ⭐ ถ้าไม่มี unitCost (Create Mode ใหม่) ให้คำนวณใหม่
//     if (cost === 0) {
//       const stockItemId = allocation.get('stockItemId')?.value;
//       if (stockItemId) {
//         const stock = this.stockOptions.find(s => s.stockItemId.toString() === stockItemId.toString());
//         if (stock) {
//           cost = stock.unitCost;
//         }
//       }
//     }
//
//     const totalCost = qty * cost;
//
//     console.log(`💵 Allocation #${index + 1} cost:`, {
//       quantity: qty,
//       unitCost: cost,
//       totalCost: totalCost
//     });
//
//     return totalCost;
//   }
//   /**
//    * ⭐ คำนวณต้นทุนรวมทั้งหมด
//    */
//   getTotalCost(): number {
//     const total = this.allocationsArray.controls.reduce((sum, control, index) => {
//       return sum + this.getAllocationCost(index);
//     }, 0);
//
//     console.log('💵 Total Cost:', total);
//     return total;
//   }
//
//   /**
//    * ⭐ ค้นหา stock
//    */
//   onSearchStock(event: any): void {
//     const term = event.target.value.toLowerCase();
//     if (!term) {
//       this.filteredStocks = [...this.stockOptions];
//       return;
//     }
//
//     this.filteredStocks = this.stockOptions.filter(stock =>
//       stock.name.toLowerCase().includes(term) ||
//       (stock.lotName && stock.lotName.toLowerCase().includes(term))
//     );
//   }
//
//   /**
//    * ⭐ แสดง stock option
//    */
//   getStockOptionDisplay(stock: StockOption): string {
//     const lotInfo = stock.lotName ? ` [${stock.lotName}]` : '';
//     const availableInfo = ` (คงเหลือ: ${stock.availableQuantity})`;
//     return `${stock.name}${lotInfo} - ฿${stock.unitCost.toFixed(3)}${availableInfo}`;
//   }
//
//   /**
//    * ⭐ เมื่อเปลี่ยนจำนวนที่ต้องใช้
//    */
//   onRequiredQuantityChange(): void {
//     this.calculateTotalAllocated();
//   }
//
//   /**
//    * ⭐ เมื่อเปลี่ยนจำนวนที่จัดสรร
//    */
//   onAllocatedQuantityChange(): void {
//     this.calculateTotalAllocated();
//   }
//
//   /**
//    * ⭐ จัดสรรอัตโนมัติตามสัดส่วน
//    */
//   autoAllocateProportionally(): void {
//     const required = parseFloat(this.ingredientForm.get('requiredQuantity')?.value || '0');
//     if (required <= 0 || this.allocationsArray.length === 0) return;
//
//     const qtyPerAllocation = required / this.allocationsArray.length;
//
//     this.allocationsArray.controls.forEach((control) => {
//       control.patchValue({ allocatedQuantity: qtyPerAllocation });
//     });
//
//     this.calculateTotalAllocated();
//   }
//
//   /**
//    * ⭐ จัดสรรยอดที่เหลือให้ allocation สุดท้าย
//    */
//   allocateRemainingToLast(): void {
//     const remaining = this.getRemainingQuantity();
//     if (remaining <= 0 || this.allocationsArray.length === 0) return;
//
//     const lastIndex = this.allocationsArray.length - 1;
//     const lastAllocation = this.allocationsArray.at(lastIndex);
//     const currentQty = parseFloat(lastAllocation.get('allocatedQuantity')?.value || '0');
//
//     lastAllocation.patchValue({
//       allocatedQuantity: currentQty + remaining
//     });
//
//     this.calculateTotalAllocated();
//   }
// }
// multi-lot-ingredient.component.ts
import {Component, Input, Output, EventEmitter, OnInit, OnChanges} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, StockOption, ProductIngredientAllocation } from '../../services/product.service';

@Component({
  selector: 'app-multi-lot-ingredient',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './multi-lot-ingredient.html',
  styleUrl: './multi-lot-ingredient.css'
})
export class MultiLotIngredientComponent implements OnInit, OnChanges {
  @Input() ingredientIndex!: number;
  @Input() ingredientForm!: FormGroup;
  @Input() stockOptions: StockOption[] = [];
  @Output() remove = new EventEmitter<void>();

  allocationMode: 'SINGLE' | 'MULTI_LOT' = 'SINGLE';
  searchTerm: string = '';
  filteredStocks: StockOption[] = [];
  totalAllocated: number = 0;

  commonUnits: string[] = ['คู่', 'ชิ้น', 'อัน', 'ใบ'];

  // ─── Searchable select: Single Mode ───────────────────────────────────────
  singleSearchTerm: string = '';
  singleDropdownOpen: boolean = false;
  singleFilteredStocks: StockOption[] = [];

  // ─── Searchable select: Multi-Lot allocations ─────────────────────────────
  allocationSearchTerms: { [key: number]: string } = {};
  allocationDropdownOpen: { [key: number]: boolean } = {};
  allocationFilteredStocks: { [key: number]: StockOption[] } = {};

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.filteredStocks = [...this.stockOptions];
    this.singleFilteredStocks = [...this.stockOptions];

    const mode = this.ingredientForm.get('allocationMode')?.value;
    this.allocationMode = mode || 'SINGLE';

    if (!this.ingredientForm.get('stockAllocations')) {
      this.ingredientForm.addControl('stockAllocations', this.fb.array([]));
    }

    // ถ้ามี stockItemId อยู่แล้ว (Edit Mode) ให้แสดงชื่อใน input
    const currentId = this.ingredientForm.get('stockItemId')?.value;
    if (currentId) {
      const found = this.stockOptions.find(s => s.stockItemId.toString() === currentId.toString());
      if (found) this.singleSearchTerm = found.name;
    }

    const allocations = this.ingredientForm.get('stockAllocations') as FormArray;
    if (allocations && allocations.length > 0) {
      allocations.controls.forEach((allocation, i) => {
        const allocId = allocation.get('stockItemId')?.value;
        const found = this.stockOptions.find(s => s.stockItemId?.toString() === allocId?.toString());
        this.allocationSearchTerms[i] = found ? found.name : '';
        this.allocationFilteredStocks[i] = [...this.stockOptions];
      });
    }

    this.calculateTotalAllocated();
  }

  ngOnChanges(changes: any): void {
    if (changes.stockOptions && changes.stockOptions.currentValue) {
      this.filteredStocks = [...changes.stockOptions.currentValue];
      this.singleFilteredStocks = [...changes.stockOptions.currentValue];
    }
  }

  get allocationsArray(): FormArray {
    return this.ingredientForm.get('stockAllocations') as FormArray;
  }

  // ─── Single Mode: Searchable select ───────────────────────────────────────

  getSingleSelectedLabel(): string {
    const id = this.ingredientForm.get('stockItemId')?.value;
    if (!id) return '';
    const stock = this.stockOptions.find(s => s.stockItemId.toString() === id.toString());
    return stock ? stock.name : '';
  }

  openSingleDropdown(): void {
    this.singleDropdownOpen = true;
    // ถ้ามีของเลือกแล้ว ให้ clear input เพื่อให้พิมพ์ค้นหาได้
    if (this.getSingleSelectedLabel()) this.singleSearchTerm = '';
    this.singleFilteredStocks = [...this.stockOptions];
  }

  closeSingleDropdown(): void {
    setTimeout(() => {
      this.singleDropdownOpen = false;
      // คืนชื่อที่เลือกกลับมาถ้ายังเลือกอยู่
      const label = this.getSingleSelectedLabel();
      this.singleSearchTerm = label || '';
    }, 160);
  }

  onSingleSearchInput(): void {
    const term = this.singleSearchTerm.toLowerCase();
    this.singleFilteredStocks = term
      ? this.stockOptions.filter(s =>
        s.name.toLowerCase().includes(term) ||
        (s.lotName && s.lotName.toLowerCase().includes(term)) ||
        s.type.toLowerCase().includes(term))
      : [...this.stockOptions];
  }

  selectSingleStock(stock: StockOption): void {
    this.ingredientForm.patchValue({ stockItemId: stock.stockItemId });
    this.singleSearchTerm = stock.name;
    this.singleDropdownOpen = false;
    this.onSingleStockChange(stock.stockItemId.toString());
  }

  clearSingleStock(): void {
    this.ingredientForm.patchValue({ stockItemId: null });
    this.singleSearchTerm = '';
    this.singleFilteredStocks = [...this.stockOptions];
  }

  // ─── Multi-Lot: Searchable select per allocation ──────────────────────────

  getFilteredAllocStocks(i: number): StockOption[] {
    return this.allocationFilteredStocks[i] ?? [...this.stockOptions];
  }

  getAllocSelectedLabel(i: number): string {
    const id = this.allocationsArray.at(i)?.get('stockItemId')?.value;
    if (!id) return '';
    const s = this.stockOptions.find(s => s.stockItemId.toString() === id.toString());
    return s ? s.name : '';
  }

  openAllocDropdown(i: number): void {
    this.allocationDropdownOpen[i] = true;
    if (this.getAllocSelectedLabel(i)) this.allocationSearchTerms[i] = '';
    this.allocationFilteredStocks[i] = [...this.stockOptions];
  }

  closeAllocDropdown(i: number): void {
    setTimeout(() => {
      this.allocationDropdownOpen[i] = false;
      const label = this.getAllocSelectedLabel(i);
      this.allocationSearchTerms[i] = label || '';
    }, 160);
  }

  onAllocSearchInput(i: number, term: string): void {
    this.allocationSearchTerms[i] = term;
    const t = term.toLowerCase();
    this.allocationFilteredStocks[i] = t
      ? this.stockOptions.filter(s =>
        s.name.toLowerCase().includes(t) ||
        (s.lotName && s.lotName.toLowerCase().includes(t)) ||
        s.type.toLowerCase().includes(t))
      : [...this.stockOptions];
  }

  selectAllocStock(i: number, stock: StockOption): void {
    this.allocationSearchTerms[i] = stock.name;
    this.allocationDropdownOpen[i] = false;
    this.onAllocationStockChange(i, stock.stockItemId.toString());
  }

  clearAllocStock(i: number): void {
    this.allocationsArray.at(i).patchValue({ stockItemId: '' });
    this.allocationSearchTerms[i] = '';
    this.allocationFilteredStocks[i] = [...this.stockOptions];
  }

  // ─── Allocation Mode Toggle ────────────────────────────────────────────────

  toggleAllocationMode(): void {
    if (this.allocationMode === 'SINGLE') {
      this.allocationMode = 'MULTI_LOT';
      this.ingredientForm.patchValue({ allocationMode: 'MULTI_LOT' });

      const stockItemId = this.ingredientForm.get('stockItemId')?.value;
      const requiredQty = this.ingredientForm.get('requiredQuantity')?.value;

      if (stockItemId && requiredQty) {
        this.addAllocationFromSingle(Number(stockItemId), Number(requiredQty));
      } else {
        this.addAllocation();
      }

      this.ingredientForm.patchValue({ stockItemId: null });
      this.singleSearchTerm = '';
    } else {
      this.allocationMode = 'SINGLE';
      this.ingredientForm.patchValue({ allocationMode: 'SINGLE' });
      this.allocationsArray.clear();
      this.ingredientForm.patchValue({ stockItemId: null });
      this.singleSearchTerm = '';
      this.allocationSearchTerms = {};
      this.allocationDropdownOpen = {};
    }
  }

  private addAllocationFromSingle(stockItemId: number, quantity: number): void {
    const stock = this.stockOptions.find(s => s.stockItemId === stockItemId);

    const allocationGroup = this.fb.group({
      stockItemId: [stockItemId, Validators.required],
      allocatedQuantity: [quantity, [Validators.required, Validators.min(0.01)]],
      allocationPriority: [1, [Validators.required, Validators.min(1)]],
      stockItemName: [stock?.name || ''],
      unitCost: [stock?.unitCost || 0],
      lotName: [stock?.lotName || ''],
      availableQuantity: [stock?.availableQuantity || 0]
    });

    this.allocationsArray.push(allocationGroup);
    const i = this.allocationsArray.length - 1;
    this.allocationSearchTerms[i] = stock?.name || '';
    this.allocationFilteredStocks[i] = [...this.stockOptions];
    this.calculateTotalAllocated();
  }

  addAllocation(): void {
    const nextPriority = this.allocationsArray.length + 1;

    const allocationGroup = this.fb.group({
      stockItemId: ['', Validators.required],
      allocatedQuantity: ['', [Validators.required, Validators.min(0.01)]],
      allocationPriority: [nextPriority, [Validators.required, Validators.min(1)]],
      stockItemName: [''],
      unitCost: [0],
      totalCost: [0],
      lotName: [''],
      availableQuantity: [0],
      stockType: ['']
    });

    this.allocationsArray.push(allocationGroup);
    const i = this.allocationsArray.length - 1;
    this.allocationSearchTerms[i] = '';
    this.allocationFilteredStocks[i] = [...this.stockOptions];
    this.allocationDropdownOpen[i] = false;
  }

  removeAllocation(index: number): void {
    this.allocationsArray.removeAt(index);
    // re-index maps
    const newTerms: { [k: number]: string } = {};
    const newOpen: { [k: number]: boolean } = {};
    const newFiltered: { [k: number]: StockOption[] } = {};
    this.allocationsArray.controls.forEach((_, i) => {
      newTerms[i] = this.allocationSearchTerms[i > index ? i + 1 : i] || '';
      newOpen[i] = false;
      newFiltered[i] = [...this.stockOptions];
    });
    this.allocationSearchTerms = newTerms;
    this.allocationDropdownOpen = newOpen;
    this.allocationFilteredStocks = newFiltered;
    this.reorderPriorities();
    this.calculateTotalAllocated();
  }

  private reorderPriorities(): void {
    this.allocationsArray.controls.forEach((control, index) => {
      control.patchValue({ allocationPriority: index + 1 });
    });
  }

  calculateTotalAllocated(): void {
    this.totalAllocated = this.allocationsArray.controls.reduce((sum, control) => {
      const qty = parseFloat(control.get('allocatedQuantity')?.value || '0');
      return sum + qty;
    }, 0);
  }

  isFullyAllocated(): boolean {
    const required = parseFloat(this.ingredientForm.get('requiredQuantity')?.value || '0');
    return Math.abs(this.totalAllocated - required) < 0.0001;
  }

  getRemainingQuantity(): number {
    const required = parseFloat(this.ingredientForm.get('requiredQuantity')?.value || '0');
    return Math.max(0, required - this.totalAllocated);
  }

  onAllocationStockChange(index: number, stockItemId: string): void {
    if (!stockItemId) {
      const allocation = this.allocationsArray.at(index);
      allocation.patchValue({ stockItemName: '', unitCost: 0, lotName: '', availableQuantity: 0, stockType: '' });
      return;
    }

    const stock = this.stockOptions.find(s => s.stockItemId.toString() === stockItemId);

    if (stock) {
      const allocation = this.allocationsArray.at(index);
      allocation.patchValue({
        stockItemId: stock.stockItemId,
        stockItemName: stock.name,
        unitCost: stock.unitCost,
        lotName: stock.lotName,
        availableQuantity: stock.availableQuantity,
        stockType: stock.type
      });

      if (index === 0) {
        if (!this.ingredientForm.get('ingredientName')?.value?.trim()) {
          this.ingredientForm.patchValue({ ingredientName: stock.name });
        }
        if (!this.ingredientForm.get('unit')?.value?.trim()) {
          this.ingredientForm.patchValue({ unit: 'คู่' });
        }
      }
    }

    this.calculateTotalAllocated();
  }

  onSingleStockChange(stockItemId: string): void {
    if (!stockItemId) {
      this.ingredientForm.patchValue({ stockItemId: null });
      return;
    }

    const stock = this.stockOptions.find(s => s.stockItemId.toString() === stockItemId);

    if (stock) {
      if (!this.ingredientForm.get('ingredientName')?.value?.trim()) {
        this.ingredientForm.patchValue({ ingredientName: stock.name });
      }
      if (!this.ingredientForm.get('unit')?.value?.trim()) {
        this.ingredientForm.patchValue({ unit: 'คู่' });
      }
    }
  }

  getAllocationCost(index: number): number {
    const allocation = this.allocationsArray.at(index);
    const qty = parseFloat(allocation.get('allocatedQuantity')?.value || '0');
    let cost = parseFloat(allocation.get('unitCost')?.value || '0');

    if (cost === 0) {
      const stockItemId = allocation.get('stockItemId')?.value;
      if (stockItemId) {
        const stock = this.stockOptions.find(s => s.stockItemId.toString() === stockItemId.toString());
        if (stock) cost = stock.unitCost;
      }
    }

    return qty * cost;
  }

  getTotalCost(): number {
    return this.allocationsArray.controls.reduce((sum, _, index) => sum + this.getAllocationCost(index), 0);
  }

  getStockOptionDisplay(stock: StockOption): string {
    const lotInfo = stock.lotName ? ` [${stock.lotName}]` : '';
    return `${stock.name}${lotInfo} - ฿${stock.unitCost.toFixed(3)} (คงเหลือ: ${stock.availableQuantity})`;
  }

  onRequiredQuantityChange(): void {
    this.calculateTotalAllocated();
  }

  onAllocatedQuantityChange(): void {
    this.calculateTotalAllocated();
  }

  autoAllocateProportionally(): void {
    const required = parseFloat(this.ingredientForm.get('requiredQuantity')?.value || '0');
    if (required <= 0 || this.allocationsArray.length === 0) return;

    const qtyPerAllocation = required / this.allocationsArray.length;
    this.allocationsArray.controls.forEach(control => {
      control.patchValue({ allocatedQuantity: qtyPerAllocation });
    });
    this.calculateTotalAllocated();
  }

  allocateRemainingToLast(): void {
    const remaining = this.getRemainingQuantity();
    if (remaining <= 0 || this.allocationsArray.length === 0) return;

    const lastIndex = this.allocationsArray.length - 1;
    const lastAllocation = this.allocationsArray.at(lastIndex);
    const currentQty = parseFloat(lastAllocation.get('allocatedQuantity')?.value || '0');
    lastAllocation.patchValue({ allocatedQuantity: currentQty + remaining });
    this.calculateTotalAllocated();
  }

  onSearchStock(event: any): void {
    const term = event.target.value.toLowerCase();
    this.filteredStocks = term
      ? this.stockOptions.filter(s =>
        s.name.toLowerCase().includes(term) ||
        (s.lotName && s.lotName.toLowerCase().includes(term)))
      : [...this.stockOptions];
  }
}
