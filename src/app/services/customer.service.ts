import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  customerId?: number;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdDate?: Date;
  updatedDate?: Date;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/customers';

  constructor(private http: HttpClient) {}

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomer(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
  }

  deleteCustomer(id: number | undefined): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchCustomers(keyword: string, status?: string): Observable<Customer[]> {
    let url = `${this.apiUrl}/search?keyword=${keyword}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<Customer[]>(url);
  }

  searchCustomersByNameOrPhone(searchTerm: string): Observable<Customer[]> {
    return this.searchCustomers(searchTerm);
  }

  // ⭐ Get customers by status
  getCustomersByStatus(status: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/status/${status}`);
  }

  // ⭐ Get statistics
  getStatistics(): Observable<CustomerStats> {
    return this.http.get<CustomerStats>(`${this.apiUrl}/stats`);
  }
}
