import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  transactionId?: number;
  type: 'INCOME' | 'EXPENSE';
  category: TransactionCategory;
  amount: number;
  transactionDate?: Date | string;
  description?: string;
  referenceType?: 'ORDER' | 'STOCK_LOT';
  referenceId?: number;
  createdDate?: Date;
  updatedDate?: Date;

  // สำหรับแสดงข้อมูลเพิ่มเติม
  orderNumber?: string;
  stockLotName?: string;
}

export type TransactionCategory =
// Income categories
  | 'ORDER_PAYMENT'
  | 'SERVICE_INCOME'
  | 'OTHER_INCOME'
  // Expense categories
  | 'STOCK_PURCHASE'
  | 'SALARY_DAILY'
  | 'SALARY_MONTHLY'
  | 'SHIPPING_COST'
  | 'OFFICE_SUPPLIES'
  | 'MARKETING'
  | 'MAINTENANCE'
  | 'RENT'
  | 'OTHER_EXPENSE';

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export interface TransactionFilter {
  type?: 'INCOME' | 'EXPENSE';
  category?: TransactionCategory;
  startDate?: string;
  endDate?: string;
  referenceType?: 'ORDER' | 'STOCK_LOT';
  referenceId?: number;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/transactions';

  constructor(private http: HttpClient) {}

  // ============================================
  // CRUD Operations
  // ============================================

  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  updateTransaction(id: number, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ============================================
  // Filter & Search
  // ============================================

  getTransactionsByType(type: 'INCOME' | 'EXPENSE'): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/type/${type}`);
  }

  getTransactionsByCategory(category: TransactionCategory): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/category/${category}`);
  }

  getTransactionsByDateRange(startDate: string, endDate: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/date-range`, {
      params: { startDate, endDate }
    });
  }

  filterTransactions(filter: TransactionFilter): Observable<Transaction[]> {
    let params = new HttpParams();

    if (filter.type) params = params.set('type', filter.type);
    if (filter.category) params = params.set('category', filter.category);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.referenceType) params = params.set('referenceType', filter.referenceType);
    if (filter.referenceId) params = params.set('referenceId', filter.referenceId.toString());

    return this.http.get<Transaction[]>(`${this.apiUrl}/filter`, { params });
  }

  // ============================================
  // Auto Transaction Creation
  // ============================================

  createAutoTransactionForOrder(orderId: number): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/auto/order/${orderId}`, {});
  }

  createAutoTransactionForStockLot(stockLotId: number): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/auto/stock-lot/${stockLotId}`, {});
  }

  // ============================================
  // Reference-based Queries
  // ============================================

  getTransactionsByOrder(orderId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/reference/order/${orderId}`);
  }

  getTransactionsByStockLot(stockLotId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/reference/stock-lot/${stockLotId}`);
  }

  // ============================================
  // Summary & Reports
  // ============================================

  getSummary(startDate?: string, endDate?: string): Observable<TransactionSummary> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<TransactionSummary>(`${this.apiUrl}/summary`, { params });
  }

  getMonthlyReport(year: number, month: number): Observable<MonthlyReport> {
    return this.http.get<MonthlyReport>(`${this.apiUrl}/reports/monthly`, {
      params: { year: year.toString(), month: month.toString() }
    });
  }

  getYearlyReport(year: number): Observable<MonthlyReport[]> {
    return this.http.get<MonthlyReport[]>(`${this.apiUrl}/reports/yearly/${year}`);
  }

  // ============================================
  // Utility Methods
  // ============================================

  getCategoryLabel(category: TransactionCategory): string {
    const categoryLabels: Record<TransactionCategory, string> = {
      // Income
      'ORDER_PAYMENT': 'รายรับจากคำสั่งซื้อ',
      'SERVICE_INCOME': 'รายรับจากบริการ',
      'OTHER_INCOME': 'รายรับอื่นๆ',
      // Expense
      'STOCK_PURCHASE': 'ซื้อสินค้า/Stock',
      'SALARY_DAILY': 'เงินเดือนรายวัน',
      'SALARY_MONTHLY': 'เงินเดือนรายเดือน',
      'SHIPPING_COST': 'ค่าขนส่ง',
      'OFFICE_SUPPLIES': 'อุปกรณ์สำนักงาน',
      'MARKETING': 'การตลาด',
      'MAINTENANCE': 'ค่าบำรุงรักษา',
      'RENT': 'ค่าเช่า',
      'OTHER_EXPENSE': 'ค่าใช้จ่ายอื่นๆ'
    };
    return categoryLabels[category] || category;
  }

  getTypeLabel(type: 'INCOME' | 'EXPENSE'): string {
    return type === 'INCOME' ? 'รายรับ' : 'รายจ่าย';
  }

  getIncomeCategories(): TransactionCategory[] {
    return ['ORDER_PAYMENT', 'SERVICE_INCOME', 'OTHER_INCOME'];
  }

  getExpenseCategories(): TransactionCategory[] {
    return [
      'STOCK_PURCHASE',
      'SALARY_DAILY',
      'SALARY_MONTHLY',
      'SHIPPING_COST',
      'OFFICE_SUPPLIES',
      'MARKETING',
      'MAINTENANCE',
      'RENT',
      'OTHER_EXPENSE'
    ];
  }

  getAllCategories(): TransactionCategory[] {
    return [...this.getIncomeCategories(), ...this.getExpenseCategories()];
  }

  formatCurrency(amount: number | undefined | null): string {
    const value = amount ?? 0;
    return `฿${value.toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
