// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { ProductService, Product } from '../../services/product.service';
//
// @Component({
//   selector: 'app-product',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './product.html',
//   styleUrls: ['./product.css']
// })
// export class ProductComponent implements OnInit {
//   filteredProducts: Product[] = [];
//   paginatedProducts: Product[] = [];
//   searchTerm: string = '';
//   selectedCategory: string = '';
//   currentPage: number = 1;
//   itemsPerPage: number = 10;
//   totalPages: number = 1;
//   loading: boolean = false;
//   selectedStatus: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' = 'ALL';
//   isDropdownOpen: boolean = false;
//   activeProduct: Product | null = null;
//
//   // ⭐ View mode
//   viewMode: 'card' | 'table' = 'card';
//
//   // ⭐ Default image (logo.jpg)
//   defaultImageUrl = 'https://chubbycharlieshop/images/products/logo.jpg';
//
//   categories: string[] = ['ถุงเท้า', 'เสื้อผ้า', 'อุปกรณ์', 'บรรจุภัณฑ์', 'อื่นๆ'];
//
//   constructor(private productService: ProductService, private router: Router) {}
//
//   ngOnInit(): void {
//     this.loadProducts();
//     this.loadCategories();
//   }
//
//   /**
//    * ⭐ Toggle view mode
//    */
//   toggleViewMode(): void {
//     this.viewMode = this.viewMode === 'card' ? 'table' : 'card';
//   }
//
//   /**
//    * ⭐ Handle image error - ใช้ default image (logo.jpg)
//    */
//   onImageError(event: any): void {
//     console.log('Image load error, using default logo.jpg');
//     event.target.src = this.defaultImageUrl;
//   }
//
//   /**
//    * ⭐ Get safe image URL (เพิ่ม fallback)
//    */
//   getSafeImageUrl(product: Product): string {
//     // ถ้าไม่มี imageUrl หรือเป็น null/empty ให้ใช้ default
//     if (!product.imageUrl || product.imageUrl === 'null' || product.imageUrl === '') {
//       return this.defaultImageUrl;
//     }
//
//     // ถ้าเป็น full URL ให้ return เลย
//     if (product.imageUrl.startsWith('https://') || product.imageUrl.startsWith('https://')) {
//       return product.imageUrl;
//     }
//
//     // ถ้าเป็น relative path ให้เติม base URL
//     if (product.imageUrl.startsWith('/')) {
//       return 'https://chubbycharlieshop' + product.imageUrl;
//     }
//
//     // Default case
//     return product.imageUrl;
//   }
//
//   get totalProducts(): number {
//     return this.filteredProducts.length;
//   }
//
//   loadProducts(): void {
//     this.loading = true;
//     this.productService.getAllProducts().subscribe({
//       next: (products) => {
//         console.log('Loaded products:', products);
//         this.filteredProducts = products.map(prod => ({
//           ...prod,
//           status: prod.status || 'ACTIVE',
//           // ⭐ Ensure imageUrl has value
//           imageUrl: prod.imageUrl || this.defaultImageUrl
//         }));
//         this.calculatePagination();
//         this.updatePaginatedData();
//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error loading products:', error);
//         this.loading = false;
//       }
//     });
//   }
//
//   loadCategories(): void {
//     this.productService.getProductCategories().subscribe({
//       next: (categories) => {
//         this.categories = categories;
//       },
//       error: (error) => console.error('Error loading categories:', error)
//     });
//   }
//
//   onSearch(): void {
//     this.currentPage = 1;
//     if (this.searchTerm.trim()) {
//       this.productService.searchProducts(this.searchTerm).subscribe({
//         next: (products) => {
//           this.filteredProducts = products.map(prod => ({
//             ...prod,
//             status: prod.status || 'ACTIVE',
//             imageUrl: prod.imageUrl || this.defaultImageUrl
//           }));
//           this.applyFilters();
//         },
//         error: (error) => console.error('Error searching products:', error)
//       });
//     } else {
//       this.loadProducts();
//     }
//   }
//
//   onFilterChange(): void {
//     this.currentPage = 1;
//     this.applyFilters();
//   }
//
//   applyFilters(): void {
//     let filtered = [...this.filteredProducts];
//
//     if (this.selectedStatus !== 'ALL') {
//       filtered = filtered.filter(product => product.status === this.selectedStatus);
//     }
//
//     if (this.selectedCategory) {
//       filtered = filtered.filter(product =>
//         product.category && product.category === this.selectedCategory
//       );
//     }
//
//     this.filteredProducts = filtered;
//     this.calculatePagination();
//     this.updatePaginatedData();
//   }
//
//   calculatePagination(): void {
//     this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
//     if (this.currentPage > this.totalPages && this.totalPages > 0) {
//       this.currentPage = this.totalPages;
//     }
//   }
//
//   updatePaginatedData(): void {
//     const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//     const endIndex = startIndex + this.itemsPerPage;
//     this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
//   }
//
//   onItemsPerPageChange(): void {
//     this.currentPage = 1;
//     this.calculatePagination();
//     this.updatePaginatedData();
//   }
//
//   goToPage(page: number): void {
//     if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
//       this.currentPage = page;
//       this.updatePaginatedData();
//     }
//   }
//
//   getPageNumbers(): number[] {
//     const pages = [];
//     const maxPages = Math.min(5, this.totalPages);
//
//     if (this.totalPages <= 5) {
//       for (let i = 1; i <= this.totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       let start = Math.max(1, this.currentPage - 2);
//       let end = Math.min(this.totalPages, start + 4);
//
//       if (end - start < 4) {
//         start = Math.max(1, end - 4);
//       }
//
//       for (let i = start; i <= end; i++) {
//         pages.push(i);
//       }
//     }
//
//     return pages;
//   }
//
//   getRowNumber(index: number): number {
//     return (this.currentPage - 1) * this.itemsPerPage + index + 1;
//   }
//
//   viewProductDetails(product: Product): void {
//     this.router.navigate(['/products', product.productId]);
//   }
//
//   openAddProductModal(): void {
//     this.router.navigate(['/products/add']);
//   }
//
//   editProduct(product: Product): void {
//     this.router.navigate(['/products/edit', product.productId]);
//     this.closeDropdown();
//   }
//
//   toggleProductStatus(product: Product): void {
//     if (product.productId) {
//       let newStatus: 'ACTIVE' | 'INACTIVE';
//
//       if (product.status === 'ACTIVE') {
//         newStatus = 'INACTIVE';
//       } else {
//         newStatus = 'ACTIVE';
//       }
//
//       const updatedProduct: Product = {
//         ...product,
//         status: newStatus
//       };
//
//       this.productService.updateProduct(product.productId, updatedProduct).subscribe({
//         next: () => {
//           this.loadProducts();
//           this.closeDropdown();
//         },
//         error: (error) => console.error('Error updating product status:', error)
//       });
//     }
//   }
//
//   recalculateProductCost(product: Product): void {
//     if (product.productId) {
//       this.productService.recalculateProductCost(product.productId).subscribe({
//         next: () => {
//           this.loadProducts();
//           this.closeDropdown();
//           alert('Product cost recalculated successfully!');
//         },
//         error: (error) => {
//           console.error('Error recalculating cost:', error);
//           alert('Error recalculating product cost. Please try again.');
//         }
//       });
//     }
//   }
//
//   viewCostAnalysis(product: Product): void {
//     if (product.productId) {
//       this.productService.getProductCostAnalysis(product.productId).subscribe({
//         next: (analysis) => {
//           console.log('Cost Analysis:', analysis);
//         },
//         error: (error) => console.error('Error loading cost analysis:', error)
//       });
//     }
//     this.closeDropdown();
//   }
//
//   deleteProduct(product: Product): void {
//     const confirmMessage = `คุณแน่ใจหรือไม่ที่จะลบสินค้า "${product.productName}"?\n\nการลบจะไม่สามารถกู้คืนได้`;
//
//     if (confirm(confirmMessage)) {
//       if (product.productId) {
//         this.loading = true;
//         this.productService.deleteProduct(product.productId).subscribe({
//           next: (response: any) => {
//             this.closeDropdown();
//             this.loadProducts();
//             alert('ลบสินค้าเรียบร้อยแล้ว!');
//           },
//           error: (error) => {
//             console.error('Error deleting product:', error);
//             this.loading = false;
//             this.closeDropdown();
//
//             let errorMessage = 'เกิดข้อผิดพลาดในการลบสินค้า';
//
//             if (error.error && error.error.message) {
//               errorMessage = error.error.message;
//             } else if (error.message) {
//               errorMessage = error.message;
//             }
//
//             alert(errorMessage + '\n\nกรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ');
//           }
//         });
//       }
//     }
//   }
//
//   recalculateAllCosts(): void {
//     if (confirm('This will recalculate costs for all products. Continue?')) {
//       this.loading = true;
//       this.productService.recalculateAllProductCosts().subscribe({
//         next: (response) => {
//           this.loadProducts();
//           alert(response.message);
//         },
//         error: (error) => {
//           console.error('Error recalculating all costs:', error);
//           alert('Error recalculating costs. Please try again.');
//           this.loading = false;
//         }
//       });
//     }
//   }
//
//   getStatusClass(status: string | null | undefined): string {
//     switch (status) {
//       case 'ACTIVE':
//         return 'badge badge-green';
//       case 'INACTIVE':
//         return 'badge badge-red';
//       case 'DISCONTINUED':
//         return 'badge badge-orange';
//       case 'N/A':
//       case null:
//       case undefined:
//         return 'badge badge-gray';
//       default:
//         return 'badge badge-gray';
//     }
//   }
//
//   formatCurrency(amount: number | undefined): string {
//     if (amount === undefined || amount === null) {
//       return '฿0.00';
//     }
//     return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
//   }
//
//   formatPercentage(percentage: number | undefined): string {
//     if (percentage === undefined || percentage === null) {
//       return '0%';
//     }
//     return `${percentage.toFixed(1)}%`;
//   }
//
//   toggleDropdown(event: Event, product: Product): void {
//     event.stopPropagation();
//     if (this.activeProduct === product) {
//       this.closeDropdown();
//     } else {
//       this.activeProduct = product;
//       this.isDropdownOpen = true;
//     }
//   }
//
//   closeDropdown(): void {
//     this.isDropdownOpen = false;
//     this.activeProduct = null;
//   }
//
//   onDocumentClick(): void {
//     if (this.isDropdownOpen) {
//       this.closeDropdown();
//     }
//   }
//
//   protected readonly Math = Math;
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.html',
  styleUrls: ['./product.css']
})
export class ProductComponent implements OnInit {
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  loading: boolean = false;
  selectedStatus: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' = 'ALL';
  isDropdownOpen: boolean = false;
  activeProduct: Product | null = null;

  // ⭐ View mode
  viewMode: 'card' | 'table' = 'card';

  // ⭐ แก้ตรงนี้
  private apiUrl = environment.apiUrl;  // ใช้จาก environment
  defaultImageUrl = '/images/products/logo.jpg';

  categories: string[] = ['ถุงเท้า', 'เสื้อผ้า', 'อุปกรณ์', 'บรรจุภัณฑ์', 'อื่นๆ'];

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  /**
   * ⭐ Toggle view mode
   */
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'card' ? 'table' : 'card';
  }

  /**
   * ⭐ Handle image error - ใช้ default image
   */
  onImageError(event: any): void {
    console.log('Image load error, using default logo.jpg');
    event.target.src = this.getFullImageUrl(this.defaultImageUrl);
  }

  /**
   * ⭐ Get full image URL (แปลง relative path เป็น full URL)
   */
  getFullImageUrl(imagePath: string | undefined | null): string {
    // ถ้าไม่มี path ให้ใช้ default
    if (!imagePath || imagePath === 'null' || imagePath === '') {
      return this.apiUrl + this.defaultImageUrl;
    }

    // ถ้าเป็น full URL อยู่แล้ว (http:// หรือ https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // ถ้าเป็น relative path ให้เติม base URL
    // จาก /images/products/abc.jpg → https://chubbycharlieshop.com/images/products/abc.jpg
    if (imagePath.startsWith('/')) {
      return this.apiUrl + imagePath;
    }

    // Default case - เติม / ข้างหน้า
    return this.apiUrl + '/' + imagePath;
  }

  /**
   * ⭐ Get safe image URL พร้อม fallback
   */
  getSafeImageUrl(product: Product): string {
    return this.getFullImageUrl(product.imageUrl);
  }

  get totalProducts(): number {
    return this.filteredProducts.length;
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Loaded products:', products);
        this.filteredProducts = products.map(prod => ({
          ...prod,
          status: prod.status || 'ACTIVE'
        }));
        this.calculatePagination();
        this.updatePaginatedData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.productService.getProductCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    if (this.searchTerm.trim()) {
      this.productService.searchProducts(this.searchTerm).subscribe({
        next: (products) => {
          this.filteredProducts = products.map(prod => ({
            ...prod,
            status: prod.status || 'ACTIVE'
          }));
          this.applyFilters();
        },
        error: (error) => console.error('Error searching products:', error)
      });
    } else {
      this.loadProducts();
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.filteredProducts];

    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(product => product.status === this.selectedStatus);
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(product =>
        product.category && product.category === this.selectedCategory
      );
    }

    this.filteredProducts = filtered;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPages = Math.min(5, this.totalPages);

    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + 4);

      if (end - start < 4) {
        start = Math.max(1, end - 4);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  getRowNumber(index: number): number {
    return (this.currentPage - 1) * this.itemsPerPage + index + 1;
  }

  viewProductDetails(product: Product): void {
    this.router.navigate(['/products', product.productId]);
  }

  openAddProductModal(): void {
    this.router.navigate(['/products/add']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.productId]);
    this.closeDropdown();
  }

  toggleProductStatus(product: Product): void {
    if (product.productId) {
      let newStatus: 'ACTIVE' | 'INACTIVE';

      if (product.status === 'ACTIVE') {
        newStatus = 'INACTIVE';
      } else {
        newStatus = 'ACTIVE';
      }

      const updatedProduct: Product = {
        ...product,
        status: newStatus
      };

      this.productService.updateProduct(product.productId, updatedProduct).subscribe({
        next: () => {
          this.loadProducts();
          this.closeDropdown();
        },
        error: (error) => console.error('Error updating product status:', error)
      });
    }
  }

  recalculateProductCost(product: Product): void {
    if (product.productId) {
      this.productService.recalculateProductCost(product.productId).subscribe({
        next: () => {
          this.loadProducts();
          this.closeDropdown();
          alert('Product cost recalculated successfully!');
        },
        error: (error) => {
          console.error('Error recalculating cost:', error);
          alert('Error recalculating product cost. Please try again.');
        }
      });
    }
  }

  viewCostAnalysis(product: Product): void {
    if (product.productId) {
      this.productService.getProductCostAnalysis(product.productId).subscribe({
        next: (analysis) => {
          console.log('Cost Analysis:', analysis);
        },
        error: (error) => console.error('Error loading cost analysis:', error)
      });
    }
    this.closeDropdown();
  }

  deleteProduct(product: Product): void {
    const confirmMessage = `คุณแน่ใจหรือไม่ที่จะลบสินค้า "${product.productName}"?\n\nการลบจะไม่สามารถกู้คืนได้`;

    if (confirm(confirmMessage)) {
      if (product.productId) {
        this.loading = true;
        this.productService.deleteProduct(product.productId).subscribe({
          next: (response: any) => {
            this.closeDropdown();
            this.loadProducts();
            alert('ลบสินค้าเรียบร้อยแล้ว!');
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.loading = false;
            this.closeDropdown();

            let errorMessage = 'เกิดข้อผิดพลาดในการลบสินค้า';

            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }

            alert(errorMessage + '\n\nกรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ');
          }
        });
      }
    }
  }

  recalculateAllCosts(): void {
    if (confirm('This will recalculate costs for all products. Continue?')) {
      this.loading = true;
      this.productService.recalculateAllProductCosts().subscribe({
        next: (response) => {
          this.loadProducts();
          alert(response.message);
        },
        error: (error) => {
          console.error('Error recalculating all costs:', error);
          alert('Error recalculating costs. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  getStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'ACTIVE':
        return 'badge badge-green';
      case 'INACTIVE':
        return 'badge badge-red';
      case 'DISCONTINUED':
        return 'badge badge-orange';
      case 'N/A':
      case null:
      case undefined:
        return 'badge badge-gray';
      default:
        return 'badge badge-gray';
    }
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) {
      return '฿0.00';
    }
    return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatPercentage(percentage: number | undefined): string {
    if (percentage === undefined || percentage === null) {
      return '0%';
    }
    return `${percentage.toFixed(1)}%`;
  }

  toggleDropdown(event: Event, product: Product): void {
    event.stopPropagation();
    if (this.activeProduct === product) {
      this.closeDropdown();
    } else {
      this.activeProduct = product;
      this.isDropdownOpen = true;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.activeProduct = null;
  }

  onDocumentClick(): void {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    }
  }

  protected readonly Math = Math;
}
