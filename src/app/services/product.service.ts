import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';

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
  status?: string; // ⭐ เพิ่ม status field
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
  lotName?: string;
  stockLotId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl + '/api/products';
  private stockApiUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getAvailableStockItems(): Observable<StockOption[]> {
    return this.http.get<StockOption[]>(`${this.apiUrl}/stock-options`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getActiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/active`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${category}`);
  }

  getProductBySku(sku: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/sku/${sku}`);
  }

  searchProducts(keyword: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  /**
   * ⭐ สร้าง Product พร้อมอัปโหลดรูปภาพ (Multipart)
   */
  createProduct(request: ProductCreateRequest, image?: File): Observable<Product> {
    const formData = new FormData();

    formData.append('product', new Blob([JSON.stringify(request)], {
      type: 'application/json'
    }));

    if (image) {
      formData.append('image', image);
    }

    return this.http.post<Product>(this.apiUrl, formData);
  }

  /**
   * ⭐ อัปเดต Product พร้อม Ingredients, รูปภาพ และ status
   */
  updateProductWithIngredients(
    id: number,
    request: ProductCreateRequest,
    image?: File,
    status?: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
  ): Observable<Product> {
    const formData = new FormData();

    // ⭐ เพิ่ม status เข้าไปใน request
    const requestWithStatus: ProductCreateRequest = {
      ...request,
      status: status || request.status || 'ACTIVE'
    };

    // ส่ง ProductCreateRequest พร้อม status
    formData.append('product', new Blob([JSON.stringify(requestWithStatus)], {
      type: 'application/json'
    }));

    // เพิ่มรูปภาพ (ถ้ามี)
    if (image) {
      formData.append('image', image);
    }

    // ⭐ Log เพื่อ debug
    console.log('📤 Sending update request:', {
      id: id,
      request: requestWithStatus,
      hasImage: !!image,
      status: requestWithStatus.status
    });

    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * ⭐ อัปเดตเฉพาะสถานะ (ไม่กระทบ Ingredients และรูปภาพ)
   * ใช้สำหรับ Toggle Status จากหน้า List
   */
  updateProductStatus(id: number, status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'): Observable<Product> {
    console.log('🔄 Updating status via PATCH:', { id, status });
    return this.http.patch<Product>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  /**
   * @deprecated ใช้ updateProductWithIngredients แทน
   */
  updateProduct(id: number, product: Product, image?: File): Observable<Product> {
    const formData = new FormData();

    const productData = {
      productName: product.productName,
      description: product.description,
      sku: product.sku,
      category: product.category,
      sellingPrice: product.sellingPrice,
      status: product.status
    };

    formData.append('product', new Blob([JSON.stringify(productData)], {
      type: 'application/json'
    }));

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

  deleteProduct(id: number): Observable<{message: string, status: string, productId: number}> {
    return this.http.delete<{message: string, status: string, productId: number}>(`${this.apiUrl}/${id}`);
  }

  discontinueProduct(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/discontinue`, {});
  }

  addIngredient(productId: number, ingredient: ProductIngredient): Observable<ProductIngredient> {
    return this.http.post<ProductIngredient>(`${this.apiUrl}/${productId}/ingredients`, ingredient);
  }

  updateIngredient(productId: number, ingredientId: number, ingredient: ProductIngredient): Observable<ProductIngredient> {
    return this.http.put<ProductIngredient>(`${this.apiUrl}/${productId}/ingredients/${ingredientId}`, ingredient);
  }

  removeIngredient(ingredientId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ingredients/${ingredientId}`);
  }

  recalculateProductCost(id: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/recalculate-cost`, {});
  }

  recalculateAllProductCosts(): Observable<{message: string, status: string}> {
    return this.http.post<{message: string, status: string}>(`${this.apiUrl}/recalculate-all-costs`, {});
  }

  recalculateProductsCostByStock(stockItemId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recalculate-by-stock/${stockItemId}`, {});
  }

  getProductCostAnalysis(id: number): Observable<ProductCostAnalysis> {
    return this.http.get<ProductCostAnalysis>(`${this.apiUrl}/${id}/cost-analysis`);
  }

  getProductsAffectedByStock(stockItemId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/affected-by-stock/${stockItemId}`);
  }

  getProductCategories(): Observable<string[]> {
    return new Observable(observer => {
      observer.next(['ถุงเท้า', 'เสื้อผ้า', 'อุปกรณ์', 'บรรจุภัณฑ์', 'อื่นๆ']);
      observer.complete();
    });
  }
}
