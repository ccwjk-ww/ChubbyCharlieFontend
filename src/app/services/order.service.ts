// // // import { Injectable } from '@angular/core';
// // // import { HttpClient, HttpHeaders } from '@angular/common/http';
// // // import { Observable } from 'rxjs';
// // //
// // // export interface Order {
// // //   orderId?: number;
// // //   orderNumber: string;
// // //   source: 'SHOP_24' | 'SHOPEE' | 'MANUAL';
// // //   customerId?: number;
// // //   customerName: string;
// // //   customerPhone?: string;
// // //   shippingAddress?: string;
// // //   orderDate?: Date;
// // //   deliveryDate?: Date;
// // //   totalAmount?: number;
// // //   shippingFee?: number;
// // //   discount?: number;
// // //   netAmount?: number;
// // //   status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
// // //   paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED';
// // //   notes?: string;
// // //   trackingNumber?: string;
// // //   originalFileName?: string;
// // //   createdDate?: Date;
// // //   updatedDate?: Date;
// // //   orderItems?: OrderItem[];
// // // }
// // //
// // // export interface OrderItem {
// // //   orderItemId?: number;
// // //   orderId?: number;
// // //   productId?: number;
// // //   productName: string;
// // //   productSku?: string;
// // //   quantity: number;
// // //   unitPrice: number;
// // //   discount?: number;
// // //   totalPrice?: number;
// // //   costPerUnit?: number;
// // //   totalCost?: number;
// // //   profit?: number;
// // //   notes?: string;
// // //   stockDeductionStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
// // // }
// // //
// // // export interface OrderUploadResponse {
// // //   success: boolean;
// // //   message: string;
// // //   order?: Order;
// // //   orders?: Order[];
// // //   totalOrders?: number;
// // //   successCount?: number;
// // //   errorCount?: number;
// // //   stockDeductionMessages?: string[];
// // // }
// // //
// // // @Injectable({
// // //   providedIn: 'root'
// // // })
// // // export class OrderService {
// // //   private apiUrl = 'https://www.chubbycharlieshop.com/api/orders';
// // //
// // //   constructor(private http: HttpClient) {}
// // //
// // //   getAllOrders(): Observable<Order[]> {
// // //     return this.http.get<Order[]>(this.apiUrl);
// // //   }
// // //
// // //   getOrderById(id: number): Observable<Order> {
// // //     return this.http.get<Order>(`${this.apiUrl}/${id}`);
// // //   }
// // //
// // //   getOrderByNumber(orderNumber: string): Observable<Order> {
// // //     return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`);
// // //   }
// // //
// // //   getOrdersByStatus(status: string): Observable<Order[]> {
// // //     return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
// // //   }
// // //
// // //   getOrdersBySource(source: string): Observable<Order[]> {
// // //     return this.http.get<Order[]>(`${this.apiUrl}/source/${source}`);
// // //   }
// // //
// // //   searchOrders(keyword: string): Observable<Order[]> {
// // //     return this.http.get<Order[]>(`${this.apiUrl}/search?keyword=${keyword}`);
// // //   }
// // //
// // //   createOrder(orderData: any): Observable<Order> {
// // //     return this.http.post<Order>(this.apiUrl, orderData);
// // //   }
// // //
// // //   updateOrder(id: number, orderData: any): Observable<Order> {
// // //     return this.http.put<Order>(`${this.apiUrl}/${id}`, orderData);
// // //   }
// // //
// // //   updateOrderStatus(id: number, status: string): Observable<Order> {
// // //     return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
// // //   }
// // //
// // //   // ✅ แก้ไขการส่งข้อมูล Payment Status
// // //   updatePaymentStatus(id: number, paymentStatus: string): Observable<Order> {
// // //     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
// // //     return this.http.patch<Order>(
// // //       `${this.apiUrl}/${id}/payment-status`,
// // //       { paymentStatus },
// // //       { headers }
// // //     );
// // //   }
// // //
// // //   cancelOrder(id: number): Observable<Order> {
// // //     return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, {});
// // //   }
// // //
// // //   deleteOrder(id: number): Observable<void> {
// // //     return this.http.delete<void>(`${this.apiUrl}/${id}`);
// // //   }
// // //
// // //   deductStockForOrder(id: number): Observable<any> {
// // //     return this.http.post(`${this.apiUrl}/${id}/deduct-stock`, {});
// // //   }
// // //
// // //   checkStockAvailability(id: number): Observable<any> {
// // //     return this.http.get(`${this.apiUrl}/${id}/check-stock`);
// // //   }
// // //
// // //   // ใหม่: อัพโหลด PDF พร้อมระบุ Customer และเลข PO
// // //   upload24ShopPDFWithCustomer(
// // //     file: File,
// // //     orderNumber: string,
// // //     customerId: number,
// // //     autoDeductStock: boolean = false
// // //   ): Observable<any> {
// // //     const formData = new FormData();
// // //     formData.append('file', file);
// // //     formData.append('orderNumber', orderNumber);
// // //     formData.append('customerId', customerId.toString());
// // //     formData.append('autoDeductStock', autoDeductStock.toString());
// // //
// // //     return this.http.post<any>(`${this.apiUrl}/upload/24shop-pdf`, formData);
// // //   }
// // //
// // //   // ใหม่: Preview PDF (แสดงเฉพาะรายการสินค้า)
// // //   preview24ShopPDF(file: File): Observable<any> {
// // //     const formData = new FormData();
// // //     formData.append('file', file);
// // //
// // //     return this.http.post<any>(`${this.apiUrl}/upload/preview-24shop-pdf`, formData);
// // //   }
// // //
// // //   uploadShopeeExcel(file: File, autoDeductStock: boolean = false): Observable<OrderUploadResponse> {
// // //     const formData = new FormData();
// // //     formData.append('file', file);
// // //     formData.append('autoDeductStock', autoDeductStock.toString());
// // //
// // //     return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/shopee-excel`, formData);
// // //   }
// // //
// // //   previewExcel(file: File): Observable<OrderUploadResponse> {
// // //     const formData = new FormData();
// // //     formData.append('file', file);
// // //
// // //     return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/preview-excel`, formData);
// // //   }
// // // }
// // import { Injectable } from '@angular/core';
// // import { HttpClient, HttpHeaders } from '@angular/common/http';
// // import { Observable } from 'rxjs';
// //
// // export interface Order {
// //   orderId?: number;
// //   orderNumber: string;
// //   source: 'SHOP_24' | 'SHOPEE' | 'MANUAL';
// //   customerId?: number;
// //   customerName: string;
// //   customerPhone?: string;
// //   shippingAddress?: string;
// //   orderDate?: Date;
// //   deliveryDate?: Date;
// //   totalAmount?: number;
// //   shippingFee?: number;
// //   discount?: number;
// //   netAmount?: number;
// //   status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
// //   paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED';
// //   notes?: string;
// //   trackingNumber?: string;
// //   originalFileName?: string;
// //   createdDate?: Date;
// //   updatedDate?: Date;
// //   orderItems?: OrderItem[];
// // }
// //
// // export interface OrderItem {
// //   orderItemId?: number;
// //   orderId?: number;
// //   productId?: number;
// //   productName: string;
// //   productSku?: string;
// //   quantity: number;
// //   unitPrice: number;
// //   discount?: number;
// //   totalPrice?: number;
// //   costPerUnit?: number;
// //   totalCost?: number;
// //   profit?: number;
// //   notes?: string;
// //   stockDeductionStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
// // }
// //
// // export interface OrderUploadResponse {
// //   success: boolean;
// //   message: string;
// //   order?: Order;
// //   orders?: Order[];
// //   totalOrders?: number;
// //   successCount?: number;
// //   errorCount?: number;
// //   stockDeductionMessages?: string[];
// // }
// //
// // // ⭐ ใหม่: Interfaces สำหรับ Stock Check Details
// // export interface StockCheckDetailsResponse {
// //   success: boolean;
// //   allAvailable: boolean;
// //   orderNumber: string;
// //   totalItems: number;
// //   details: StockCheckDetail[];
// //   message: string;
// // }
// //
// // export interface StockCheckDetail {
// //   orderItemId: number;
// //   productName: string;
// //   orderQuantity: number;
// //   available: boolean;
// //   errorMessage?: string;
// //   ingredients: IngredientDetail[];
// // }
// //
// // export interface IngredientDetail {
// //   ingredientName: string;
// //   unit: string;
// //   requiredQuantity: number;
// //   stockItemId?: number;
// //   stockItemName?: string;
// //   currentStock?: number;
// //   available: boolean;
// //   shortage?: number;
// //   errorMessage?: string;
// // }
// //
// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class OrderService {
// //   private apiUrl = 'https://www.chubbycharlieshop.com/api/orders';
// //
// //   constructor(private http: HttpClient) {}
// //
// //   getAllOrders(): Observable<Order[]> {
// //     return this.http.get<Order[]>(this.apiUrl);
// //   }
// //
// //   getOrderById(id: number): Observable<Order> {
// //     return this.http.get<Order>(`${this.apiUrl}/${id}`);
// //   }
// //
// //   getOrderByNumber(orderNumber: string): Observable<Order> {
// //     return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`);
// //   }
// //
// //   getOrdersByStatus(status: string): Observable<Order[]> {
// //     return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
// //   }
// //
// //   getOrdersBySource(source: string): Observable<Order[]> {
// //     return this.http.get<Order[]>(`${this.apiUrl}/source/${source}`);
// //   }
// //
// //   searchOrders(keyword: string): Observable<Order[]> {
// //     return this.http.get<Order[]>(`${this.apiUrl}/search?keyword=${keyword}`);
// //   }
// //
// //   createOrder(orderData: any): Observable<Order> {
// //     return this.http.post<Order>(this.apiUrl, orderData);
// //   }
// //
// //   updateOrder(id: number, orderData: any): Observable<Order> {
// //     return this.http.put<Order>(`${this.apiUrl}/${id}`, orderData);
// //   }
// //
// //   updateOrderStatus(id: number, status: string): Observable<Order> {
// //     return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
// //   }
// //
// //   updatePaymentStatus(id: number, paymentStatus: string): Observable<Order> {
// //     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
// //     return this.http.patch<Order>(
// //       `${this.apiUrl}/${id}/payment-status`,
// //       { paymentStatus },
// //       { headers }
// //     );
// //   }
// //
// //   cancelOrder(id: number): Observable<Order> {
// //     return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, {});
// //   }
// //
// //   deleteOrder(id: number): Observable<void> {
// //     return this.http.delete<void>(`${this.apiUrl}/${id}`);
// //   }
// //
// //   deductStockForOrder(id: number): Observable<any> {
// //     return this.http.post(`${this.apiUrl}/${id}/deduct-stock`, {});
// //   }
// //
// //   checkStockAvailability(id: number): Observable<any> {
// //     return this.http.get(`${this.apiUrl}/${id}/check-stock`);
// //   }
// //
// //   /**
// //    * ⭐ ใหม่: เช็ค Stock พร้อมรายละเอียด Ingredient (สำหรับ Modal)
// //    */
// //   checkStockDetails(id: number): Observable<StockCheckDetailsResponse> {
// //     return this.http.get<StockCheckDetailsResponse>(`${this.apiUrl}/${id}/check-stock-details`);
// //   }
// //
// //   upload24ShopPDFWithCustomer(
// //     file: File,
// //     orderNumber: string,
// //     customerId: number,
// //     autoDeductStock: boolean = false
// //   ): Observable<any> {
// //     const formData = new FormData();
// //     formData.append('file', file);
// //     formData.append('orderNumber', orderNumber);
// //     formData.append('customerId', customerId.toString());
// //     formData.append('autoDeductStock', autoDeductStock.toString());
// //
// //     return this.http.post<any>(`${this.apiUrl}/upload/24shop-pdf`, formData);
// //   }
// //
// //   preview24ShopPDF(file: File): Observable<any> {
// //     const formData = new FormData();
// //     formData.append('file', file);
// //
// //     return this.http.post<any>(`${this.apiUrl}/upload/preview-24shop-pdf`, formData);
// //   }
// //
// //   uploadShopeeExcel(file: File, autoDeductStock: boolean = false): Observable<OrderUploadResponse> {
// //     const formData = new FormData();
// //     formData.append('file', file);
// //     formData.append('autoDeductStock', autoDeductStock.toString());
// //
// //     return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/shopee-excel`, formData);
// //   }
// //
// //   previewExcel(file: File): Observable<OrderUploadResponse> {
// //     const formData = new FormData();
// //     formData.append('file', file);
// //
// //     return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/preview-excel`, formData);
// //   }
// // }
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
//
// export interface Order {
//   orderId?: number;
//   orderNumber: string;
//   source: 'SHOP_24' | 'SHOPEE' | 'MANUAL';
//   customerId?: number;
//   customerName: string;
//   customerPhone?: string;
//   shippingAddress?: string;
//   orderDate?: Date;
//   deliveryDate?: Date;
//   totalAmount?: number;
//   shippingFee?: number;
//   discount?: number;
//   netAmount?: number;
//   status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
//   paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED';
//   notes?: string;
//   trackingNumber?: string;
//   originalFileName?: string;
//   createdDate?: Date;
//   updatedDate?: Date;
//   orderItems?: OrderItem[];
// }
//
// export interface OrderItem {
//   orderItemId?: number;
//   orderId?: number;
//   productId?: number;
//   productName: string;
//   productSku?: string;
//   quantity: number;
//   unitPrice: number;
//   discount?: number;
//   totalPrice?: number;
//   costPerUnit?: number;
//   totalCost?: number;
//   profit?: number;
//   notes?: string;
//   stockDeductionStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
// }
//
// export interface OrderUploadResponse {
//   success: boolean;
//   message: string;
//   order?: Order;
//   orders?: Order[];
//   totalOrders?: number;
//   successCount?: number;
//   errorCount?: number;
//   stockDeductionMessages?: string[];
// }
//
// // ⭐ Interfaces สำหรับ Stock Check Details
// export interface StockCheckDetailsResponse {
//   success: boolean;
//   allAvailable: boolean;
//   orderNumber: string;
//   totalItems: number;
//   details: StockCheckDetail[];
//   message: string;
// }
//
// export interface StockCheckDetail {
//   orderItemId: number;
//   productName: string;
//   orderQuantity: number;
//   available: boolean;
//   errorMessage?: string;
//   ingredients: IngredientDetail[];
// }
//
// // ⭐ เพิ่ม Stock Lot Information
// export interface IngredientDetail {
//   ingredientName: string;
//   unit: string;
//   requiredQuantity: number;
//   stockItemId?: number;
//   stockItemName?: string;
//   stockType?: 'CHINA' | 'THAI';
//   currentStock?: number;
//   available: boolean;
//   shortage?: number;
//   errorMessage?: string;
//
//   // ⭐ Stock Lot Information
//   stockLotId?: number;
//   stockLotName?: string;
//   stockLotStatus?: string;
// }
//
// @Injectable({
//   providedIn: 'root'
// })
// export class OrderService {
//   private apiUrl = 'https://www.chubbycharlieshop.com/api/orders';
//
//   constructor(private http: HttpClient) {}
//
//   getAllOrders(): Observable<Order[]> {
//     return this.http.get<Order[]>(this.apiUrl);
//   }
//
//   getOrderById(id: number): Observable<Order> {
//     return this.http.get<Order>(`${this.apiUrl}/${id}`);
//   }
//
//   getOrderByNumber(orderNumber: string): Observable<Order> {
//     return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`);
//   }
//
//   getOrdersByStatus(status: string): Observable<Order[]> {
//     return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
//   }
//
//   getOrdersBySource(source: string): Observable<Order[]> {
//     return this.http.get<Order[]>(`${this.apiUrl}/source/${source}`);
//   }
//
//   searchOrders(keyword: string): Observable<Order[]> {
//     return this.http.get<Order[]>(`${this.apiUrl}/search?keyword=${keyword}`);
//   }
//
//   createOrder(orderData: any): Observable<Order> {
//     return this.http.post<Order>(this.apiUrl, orderData);
//   }
//
//   updateOrder(id: number, orderData: any): Observable<Order> {
//     return this.http.put<Order>(`${this.apiUrl}/${id}`, orderData);
//   }
//
//   updateOrderStatus(id: number, status: string): Observable<Order> {
//     return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
//   }
//
//   updatePaymentStatus(id: number, paymentStatus: string): Observable<Order> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.patch<Order>(
//       `${this.apiUrl}/${id}/payment-status`,
//       { paymentStatus },
//       { headers }
//     );
//   }
//
//   cancelOrder(id: number): Observable<Order> {
//     return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, {});
//   }
//
//   deleteOrder(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/${id}`);
//   }
//
//   deductStockForOrder(id: number): Observable<any> {
//     return this.http.post(`${this.apiUrl}/${id}/deduct-stock`, {});
//   }
//
//   checkStockAvailability(id: number): Observable<any> {
//     return this.http.get(`${this.apiUrl}/${id}/check-stock`);
//   }
//
//   /**
//    * ⭐ เช็ค Stock พร้อมรายละเอียด Ingredient + Stock Lot
//    */
//   checkStockDetails(id: number): Observable<StockCheckDetailsResponse> {
//     return this.http.get<StockCheckDetailsResponse>(`${this.apiUrl}/${id}/check-stock-details`);
//   }
//
//   upload24ShopPDFWithCustomer(
//     file: File,
//     orderNumber: string,
//     customerId: number,
//     autoDeductStock: boolean = false
//   ): Observable<any> {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('orderNumber', orderNumber);
//     formData.append('customerId', customerId.toString());
//     formData.append('autoDeductStock', autoDeductStock.toString());
//
//     return this.http.post<any>(`${this.apiUrl}/upload/24shop-pdf`, formData);
//   }
//
//   preview24ShopPDF(file: File): Observable<any> {
//     const formData = new FormData();
//     formData.append('file', file);
//
//     return this.http.post<any>(`${this.apiUrl}/upload/preview-24shop-pdf`, formData);
//   }
//
//   uploadShopeeExcel(file: File, autoDeductStock: boolean = false): Observable<OrderUploadResponse> {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('autoDeductStock', autoDeductStock.toString());
//
//     return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/shopee-excel`, formData);
//   }
//
//   previewExcel(file: File): Observable<OrderUploadResponse> {
//     const formData = new FormData();
//     formData.append('file', file);
//
//     return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/preview-excel`, formData);
//   }
//   /**
//    * ⭐ NEW: คืน Stock ที่ตัดไปแล้ว
//    */
//   restoreStockForOrder(id: number): Observable<any> {
//     return this.http.post(`${this.apiUrl}/${id}/restore-stock`, {});
//   }
//
//   /**
//    * ⭐ NEW: เช็คสถานะการตัด Stock
//    */
//   getStockDeductionStatus(id: number): Observable<any> {
//     return this.http.get(`${this.apiUrl}/${id}/stock-deduction-status`);
//   }
//
//   // เพิ่มใน order.service.ts
//
//   /**
//    * ⭐ NEW: Upload TikTok PDF
//    */
//   uploadTiktokPDF(file: File, autoDeductStock: boolean = false): Observable<any> {
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('autoDeductStock', autoDeductStock.toString());
//
//     return this.http.post<any>(`${this.apiUrl}/upload/tiktok-pdf`, formData);
//   }
//
//   /**
//    * ⭐ NEW: Preview TikTok PDF
//    */
//   previewTiktokPDF(file: File): Observable<any> {
//     const formData = new FormData();
//     formData.append('file', file);
//
//     return this.http.post<any>(`${this.apiUrl}/upload/preview-tiktok-pdf`, formData);
//   }
//
// }
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  orderId?: number;
  orderNumber: string;
  source: 'SHOP_24' | 'SHOPEE' | 'TIKTOK' | 'MANUAL';
  customerId?: number;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: string;
  orderDate?: Date;
  deliveryDate?: Date;
  totalAmount?: number;
  shippingFee?: number;
  discount?: number;
  netAmount?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentStatus?: 'UNPAID' | 'PAID' | 'REFUNDED';
  notes?: string;
  trackingNumber?: string;
  originalFileName?: string;
  createdDate?: Date;
  updatedDate?: Date;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  orderItemId?: number;
  orderId?: number;
  productId?: number;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice?: number;
  costPerUnit?: number;
  totalCost?: number;
  profit?: number;
  notes?: string;
  stockDeductionStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export interface OrderUploadResponse {
  success: boolean;
  message: string;
  order?: Order;
  orders?: Order[];
  totalOrders?: number;
  successCount?: number;
  errorCount?: number;
  stockDeductionMessages?: string[];
}

// ⭐ Interfaces สำหรับ Stock Check Details
export interface StockCheckDetailsResponse {
  success: boolean;
  allAvailable: boolean;
  orderNumber: string;
  totalItems: number;
  details: StockCheckDetail[];
  message: string;
}

export interface StockCheckDetail {
  orderItemId: number;
  productName: string;
  orderQuantity: number;
  available: boolean;
  errorMessage?: string;
  ingredients: IngredientDetail[];
}

// ⭐ เพิ่ม Stock Lot Information
export interface IngredientDetail {
  ingredientName: string;
  unit: string;
  requiredQuantity: number;
  stockItemId?: number;
  stockItemName?: string;
  stockType?: 'CHINA' | 'THAI';
  currentStock?: number;
  available: boolean;
  shortage?: number;
  errorMessage?: string;

  // ⭐ Stock Lot Information
  stockLotId?: number;
  stockLotName?: string;
  stockLotStatus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/orders';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/number/${orderNumber}`);
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/status/${status}`);
  }

  getOrdersBySource(source: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/source/${source}`);
  }

  searchOrders(keyword: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  updateOrder(id: number, orderData: any): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, orderData);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  updatePaymentStatus(id: number, paymentStatus: string): Observable<Order> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.patch<Order>(
      `${this.apiUrl}/${id}/payment-status`,
      { paymentStatus },
      { headers }
    );
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, {});
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deductStockForOrder(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/deduct-stock`, {});
  }

  checkStockAvailability(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/check-stock`);
  }

  /**
   * ⭐ เช็ค Stock พร้อมรายละเอียด Ingredient + Stock Lot
   */
  checkStockDetails(id: number): Observable<StockCheckDetailsResponse> {
    return this.http.get<StockCheckDetailsResponse>(`${this.apiUrl}/${id}/check-stock-details`);
  }

  /**
   * ⭐ 24Shop - Upload PDF with Gemini AI
   */
  upload24ShopPDFWithCustomer(
    file: File,
    orderNumber: string,
    customerId: number,
    autoDeductStock: boolean = false
  ): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderNumber', orderNumber);
    formData.append('customerId', customerId.toString());
    formData.append('autoDeductStock', autoDeductStock.toString());

    return this.http.post<any>(`${this.apiUrl}/upload/24shop-pdf`, formData);
  }

  /**
   * ⭐ 24Shop - Preview PDF with Gemini AI
   */
  preview24ShopPDF(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.apiUrl}/upload/preview-24shop-pdf`, formData);
  }

  /**
   * ⭐ TikTok - Upload Excel with Gemini AI
   */
  uploadTiktokExcel(file: File, customerId: number, autoDeductStock: boolean = false): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customerId', customerId.toString());
    formData.append('autoDeductStock', autoDeductStock.toString());

    return this.http.post<any>(`${this.apiUrl}/upload/tiktok-excel`, formData);
  }

  /**
   * ⭐ TikTok - Preview Excel with Gemini AI
   */
  previewTiktokExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.apiUrl}/upload/preview-tiktok-excel`, formData);
  }

  /**
   * ⭐ Shopee - Upload Excel (Traditional Parser)
   */
  uploadShopeeExcel(file: File, autoDeductStock: boolean = false): Observable<OrderUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('autoDeductStock', autoDeductStock.toString());

    return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/shopee-excel`, formData);
  }

  /**
   * ⭐ Shopee - Preview Excel
   */
  previewExcel(file: File): Observable<OrderUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<OrderUploadResponse>(`${this.apiUrl}/upload/preview-excel`, formData);
  }

  /**
   * ⭐ Stock Restoration - คืน Stock
   */
  restoreStockForOrder(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/restore-stock`, {});
  }

  /**
   * ⭐ Stock Deduction Status
   */
  getStockDeductionStatus(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/stock-deduction-status`);
  }
}
