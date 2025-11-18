import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface EmployeeDTO {
  empId: number;
  empName: string;
  empAddress?: string;
  empPhone?: string;
  empType?: string;
  dailyWage?: number;
  monthlySalary?: number;
  role: string;
  username: string;
  email?: string;
  status: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  employee: EmployeeDTO;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://www.chubbycharlieshop.com/api/auth';

  // BehaviorSubject สำหรับเก็บสถานะ login
  private currentUserSubject = new BehaviorSubject<EmployeeDTO | null>(this.getCurrentUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * ⭐ Login
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        if (response.success && response.token) {
          // เก็บ token และข้อมูล user ใน localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.employee));

          // อัพเดท BehaviorSubject
          this.currentUserSubject.next(response.employee);
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  /**
   * ⭐ Logout
   */
  logout(): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => {
        // ลบข้อมูลจาก localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');

        // อัพเดท BehaviorSubject
        this.currentUserSubject.next(null);
        this.isLoggedInSubject.next(false);
      })
    );
  }

  /**
   * ⭐ Validate Token
   */
  validateToken(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/validate`, { headers });
  }

  /**
   * ⭐ Change Password
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    }, { headers });
  }

  /**
   * ⭐ Get Token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * ⭐ Get Current User
   */
  getCurrentUser(): EmployeeDTO | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * ⭐ Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  /**
   * ⭐ Check if user has token
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * ⭐ Check if user is Admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role?.toUpperCase() === 'ADMIN';
  }

  /**
   * ⭐ Check if user is Manager
   */
  isManager(): boolean {
    const user = this.getCurrentUser();
    return user?.role?.toUpperCase() === 'MANAGER';
  }

  /**
   * ⭐ Check if user is Admin or Manager
   */
  isAuthorized(): boolean {
    return this.isAdmin() || this.isManager();
  }

  /**
   * ⭐ Get Authorization Headers
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * ⭐ Auto logout on token expiration
   */
  checkTokenExpiration(): void {
    this.validateToken().subscribe({
      next: (response) => {
        if (!response.valid) {
          this.logout().subscribe();
        }
      },
      error: () => {
        this.logout().subscribe();
      }
    });
  }
}
