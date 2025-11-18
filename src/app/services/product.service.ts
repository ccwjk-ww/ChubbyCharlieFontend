// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
//
// export interface Product {
//   productId?: number;
//   productName: string;
//   description?: string;
//   sku: string;
//   category?: string;
//   sellingPrice: number;
//   calculatedCost?: number;
//   profitMargin?: number;
//   status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
//   createdDate?: Date;
//   updatedDate?: Date;
//   ingredients?: ProductIngredient[];
// }
//
// export interface ProductIngredient {
//   ingredientId?: number;
//   productId?: number;
//   stockItemId?: number;
//   ingredientName: string;
//   requiredQuantity: number;
//   unit: string;
//   costPerUnit?: number;
//   totalCost?: number;
//   notes?: string;
//   stockItemName?: string;
//   stockType?: string;
//   availableQuantity?: number;
// }
//
// export interface ProductCreateRequest {
//   productName: string;
//   description?: string;
//   sku: string;
//   category?: string;
//   sellingPrice: number;
//   ingredients: ProductIngredientRequest[];
// }
//
// export interface ProductIngredientRequest {
//   stockItemId?: number;
//   ingredientName: string;
//   requiredQuantity: number;
//   unit: string;
//   notes?: string;
// }
//
// export interface ProductCostAnalysis {
//   productId: number;
//   productName: string;
//   totalMaterialCost: number;
//   sellingPrice: number;
//   grossProfit: number;
//   profitMarginPercentage: number;
//   ingredientBreakdown: IngredientCostBreakdown[];
// }
//
// export interface IngredientCostBreakdown {
//   ingredientName: string;
//   requiredQuantity: number;
//   unit: string;
//   costPerUnit: number;
//   totalCost: number;
//   costPercentage: number;
//   stockSource: string;
// }
//
// export interface StockOption {
//   stockItemId: number;
//   name: string;
//   type: 'CHINA' | 'THAI';
//   unitCost: number;
//   availableQuantity: number;
//   status: string;
// }
//
// @Injectable({
//   providedIn: 'root'
// })
// export class ProductService {
//   private apiUrl = 'http://localhost:8080/api/products';
//   private stockApiUrl = 'http://localhost:8080/api';
//
//   constructor(private http: HttpClient) {}
//
//   // Get all products
//   getAllProducts(): Observable<Product[]> {
//     return this.http.get<Product[]>(this.apiUrl);
//   }
//
//   // Get product by ID
//   getProductById(id: number): Observable<Product> {
//     return this.http.get<Product>(`${this.apiUrl}/${id}`);
//   }
//
//   // Get active products
//   getActiveProducts(): Observable<Product[]> {
//     return this.http.get<Product[]>(`${this.apiUrl}/active`);
//   }
//
//   // Get products by category
//   getProductsByCategory(category: string): Observable<Product[]> {
//     return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`);
//   }
//
//   // Get product by SKU
//   getProductBySku(sku: string): Observable<Product> {
//     return this.http.get<Product>(`${this.apiUrl}/sku/${sku}`);
//   }
//
//   // Search products
//   searchProducts(keyword: string): Observable<Product[]> {
//     return this.http.get<Product[]>(`${this.apiUrl}/search?keyword=${keyword}`);
//   }
//
//   // Create product
//   createProduct(request: ProductCreateRequest): Observable<Product> {
//     return this.http.post<Product>(this.apiUrl, request);
//   }
//
//   // Update product
//   updateProduct(id: number, product: Product): Observable<Product> {
//     return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
//   }
//
//   // แก้ไขเฉพาะ deleteProduct method ใน ProductService
//
// // Delete product - แก้ไข return type
//   deleteProduct(id: number): Observable<{message: string, status: string, productId: number}> {
//     return this.http.delete<{message: string, status: string, productId: number}>(`${this.apiUrl}/${id}`);
//   }
//
//   // Discontinue product (soft delete)
//   discontinueProduct(id: number): Observable<Product> {
//     return this.http.patch<Product>(`${this.apiUrl}/${id}/discontinue`, {});
//   }
//
//   // Add ingredient to product
//   addIngredient(productId: number, ingredient: ProductIngredient): Observable<ProductIngredient> {
//     return this.http.post<ProductIngredient>(`${this.apiUrl}/${productId}/ingredients`, ingredient);
//   }
//
//   // Update ingredient
//   updateIngredient(productId: number, ingredientId: number, ingredient: ProductIngredient): Observable<ProductIngredient> {
//     return this.http.put<ProductIngredient>(`${this.apiUrl}/${productId}/ingredients/${ingredientId}`, ingredient);
//   }
//
//   // Remove ingredient
//   removeIngredient(ingredientId: number): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/ingredients/${ingredientId}`);
//   }
//
//   // Recalculate product cost
//   recalculateProductCost(id: number): Observable<Product> {
//     return this.http.post<Product>(`${this.apiUrl}/${id}/recalculate-cost`, {});
//   }
//
//   // Recalculate all product costs
//   recalculateAllProductCosts(): Observable<{message: string, status: string}> {
//     return this.http.post<{message: string, status: string}>(`${this.apiUrl}/recalculate-all-costs`, {});
//   }
//
//   // Recalculate costs by stock
//   recalculateProductsCostByStock(stockItemId: number): Observable<any> {
//     return this.http.post<any>(`${this.apiUrl}/recalculate-by-stock/${stockItemId}`, {});
//   }
//
//   // Get product cost analysis
//   getProductCostAnalysis(id: number): Observable<ProductCostAnalysis> {
//     return this.http.get<ProductCostAnalysis>(`${this.apiUrl}/${id}/cost-analysis`);
//   }
//
//   // Get products affected by stock item
//   getProductsAffectedByStock(stockItemId: number): Observable<Product[]> {
//     return this.http.get<Product[]>(`${this.apiUrl}/affected-by-stock/${stockItemId}`);
//   }
//
//   // Get available stock items (for dropdown)
//   getAvailableStockItems(): Observable<StockOption[]> {
//     return new Observable(observer => {
//       const chinaStocks$ = this.http.get<any[]>(`${this.stockApiUrl}/china-stocks`);
//       const thaiStocks$ = this.http.get<any[]>(`${this.stockApiUrl}/thai-stocks`);
//
//       Promise.all([
//         chinaStocks$.toPromise(),
//         thaiStocks$.toPromise()
//       ]).then(([chinaStocks, thaiStocks]) => {
//         const stockOptions: StockOption[] = [];
//
//         chinaStocks?.forEach(stock => {
//           stockOptions.push({
//             stockItemId: stock.stockItemId,
//             name: stock.name,
//             type: 'CHINA',
//             unitCost: stock.finalPricePerPair || 0,
//             availableQuantity: stock.quantity || 0,
//             status: stock.status
//           });
//         });
//
//         thaiStocks?.forEach(stock => {
//           stockOptions.push({
//             stockItemId: stock.stockItemId,
//             name: stock.name,
//             type: 'THAI',
//             unitCost: stock.pricePerUnitWithShipping || 0,
//             availableQuantity: stock.quantity || 0,
//             status: stock.status
//           });
//         });
//
//         observer.next(stockOptions);
//         observer.complete();
//       }).catch(error => observer.error(error));
//     });
//   }
//
//   // Get product categories (hardcoded for now)
//   getProductCategories(): Observable<string[]> {
//     return new Observable(observer => {
//       observer.next(['ถุงเท้า', 'เสื้อผ้า', 'อุปกรณ์', 'บรรจุภัณฑ์', 'อื่นๆ']);
//       observer.complete();
//     });
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  productId?: number;
  productName: string;
  description?: string;
  sku: string;
  category?: string;
  sellingPrice: number;
  calculatedCost?: number;
  profitMargin?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  createdDate?: Date;
  updatedDate?: Date;
  ingredients?: ProductIngredient[];
  // ⭐ เพิ่ม: รองรับรูปภาพ
  imageUrl?: string;
  isUsingDefaultImage?: boolean;
}

export interface ProductIngredient {
  ingredientId?: number;
  productId?: number;
  stockItemId?: number;
  ingredientName: string;
  requiredQuantity: number;
  unit: string;
  costPerUnit?: number;
  totalCost?: number;
  notes?: string;
  stockItemName?: string;
  stockType?: string;
  availableQuantity?: number;
}

export interface ProductCreateRequest {
  productName: string;
  description?: string;
  sku: string;
  category?: string;
  sellingPrice: number;
  ingredients: ProductIngredientRequest[];
}

export interface ProductIngredientRequest {
  stockItemId?: number;
  ingredientName: string;
  requiredQuantity: number;
  unit: string;
  notes?: string;
}

export interface ProductCostAnalysis {
  productId: number;
  productName: string;
  totalMaterialCost: number;
  sellingPrice: number;
  grossProfit: number;
  profitMarginPercentage: number;
  ingredientBreakdown: IngredientCostBreakdown[];
}

export interface IngredientCostBreakdown {
  ingredientName: string;
  requiredQuantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  costPercentage: number;
  stockSource: string;
}

export interface StockOption {
  stockItemId: number;
  name: string;
  type: 'CHINA' | 'THAI';
  unitCost: number;
  availableQuantity: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/products';
  private stockApiUrl = 'https://www.chubbycharlieshop.com/api';

  constructor(private http: HttpClient) {}

  // Get all products
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Get active products
  getActiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/active`);
  }

  // Get products by category
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`);
  }

  // Get product by SKU
  getProductBySku(sku: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/sku/${sku}`);
  }

  // Search products
  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  /**
   * ⭐ สร้าง Product พร้อมอัปโหลดรูปภาพ (Multipart)
   */
  createProduct(request: ProductCreateRequest, image?: File): Observable<Product> {
    const formData = new FormData();

    // เพิ่มข้อมูล Product เป็น JSON
    formData.append('product', new Blob([JSON.stringify(request)], {
      type: 'application/json'
    }));

    // เพิ่มรูปภาพ (ถ้ามี)
    if (image) {
      formData.append('image', image);
    }

    return this.http.post<Product>(this.apiUrl, formData);
  }

  /**
   * ⭐ อัปเดต Product พร้อมเปลี่ยนรูปภาพ (Multipart)
   */
  updateProduct(id: number, product: Product, image?: File): Observable<Product> {
    const formData = new FormData();

    // เพิ่มข้อมูล Product เป็น JSON
    formData.append('product', new Blob([JSON.stringify(product)], {
      type: 'application/json'
    }));

    // เพิ่มรูปภาพ (ถ้ามี)
    if (image) {
      formData.append('image', image);
    }

    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * ⭐ อัปเดตเฉพาะข้อมูล (ไม่เปลี่ยนรูป)
   */
  updateProductData(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}/data`, product);
  }

  // Delete product
  deleteProduct(id: number): Observable<{message: string, status: string, productId: number}> {
    return this.http.delete<{message: string, status: string, productId: number}>(`${this.apiUrl}/${id}`);
  }

  // Discontinue product (soft delete)
  discontinueProduct(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/discontinue`, {});
  }

  // Add ingredient to product
  addIngredient(productId: number, ingredient: ProductIngredient): Observable<ProductIngredient> {
    return this.http.post<ProductIngredient>(`${this.apiUrl}/${productId}/ingredients`, ingredient);
  }

  // Update ingredient
  updateIngredient(productId: number, ingredientId: number, ingredient: ProductIngredient): Observable<ProductIngredient> {
    return this.http.put<ProductIngredient>(`${this.apiUrl}/${productId}/ingredients/${ingredientId}`, ingredient);
  }

  // Remove ingredient
  removeIngredient(ingredientId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ingredients/${ingredientId}`);
  }

  // Recalculate product cost
  recalculateProductCost(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/recalculate-cost`, {});
  }

  // Recalculate all product costs
  recalculateAllProductCosts(): Observable<{message: string, status: string}> {
    return this.http.post<{message: string, status: string}>(`${this.apiUrl}/recalculate-all-costs`, {});
  }

  // Recalculate costs by stock
  recalculateProductsCostByStock(stockItemId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recalculate-by-stock/${stockItemId}`, {});
  }

  // Get product cost analysis
  getProductCostAnalysis(id: number): Observable<ProductCostAnalysis> {
    return this.http.get<ProductCostAnalysis>(`${this.apiUrl}/${id}/cost-analysis`);
  }

  // Get products affected by stock item
  getProductsAffectedByStock(stockItemId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/affected-by-stock/${stockItemId}`);
  }

  // Get available stock items (for dropdown)
  getAvailableStockItems(): Observable<StockOption[]> {
    return new Observable(observer => {
      const chinaStocks$ = this.http.get<any[]>(`${this.stockApiUrl}/china-stocks`);
      const thaiStocks$ = this.http.get<any[]>(`${this.stockApiUrl}/thai-stocks`);

      Promise.all([
        chinaStocks$.toPromise(),
        thaiStocks$.toPromise()
      ]).then(([chinaStocks, thaiStocks]) => {
        const stockOptions: StockOption[] = [];

        chinaStocks?.forEach(stock => {
          stockOptions.push({
            stockItemId: stock.stockItemId,
            name: stock.name,
            type: 'CHINA',
            unitCost: stock.finalPricePerPair || 0,
            availableQuantity: stock.quantity || 0,
            status: stock.status
          });
        });

        thaiStocks?.forEach(stock => {
          stockOptions.push({
            stockItemId: stock.stockItemId,
            name: stock.name,
            type: 'THAI',
            unitCost: stock.pricePerUnitWithShipping || 0,
            availableQuantity: stock.quantity || 0,
            status: stock.status
          });
        });

        observer.next(stockOptions);
        observer.complete();
      }).catch(error => observer.error(error));
    });
  }

  // Get product categories
  getProductCategories(): Observable<string[]> {
    return new Observable(observer => {
      observer.next(['ถุงเท้า', 'เสื้อผ้า', 'อุปกรณ์', 'บรรจุภัณฑ์', 'อื่นๆ']);
      observer.complete();
    });
  }
}
