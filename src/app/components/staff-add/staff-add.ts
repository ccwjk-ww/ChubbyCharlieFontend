import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { EmployeeService, Employee } from '../../services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, map, catchError, of, debounceTime, switchMap, first } from 'rxjs';

@Component({
  selector: 'app-staff-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './staff-add.html',
  styleUrl: './staff-add.css'
})
export class StaffAdd implements OnInit {
  staffForm: FormGroup;
  selectedFile: File | null = null;
  isEditMode: boolean = false;
  employeeId: number | null = null;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.staffForm = this.fb.group({
      empName: ['', [Validators.required, Validators.minLength(2)]],
      empAddress: ['', [Validators.required, Validators.minLength(5)]],
      empPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      empType: ['', Validators.required],
      dailyWage: [{ value: '', disabled: true }, [Validators.min(0)]],
      monthlySalary: [{ value: '', disabled: true }, [Validators.min(0)]],
      role: ['', Validators.required],
      username: ['',
        [Validators.required, Validators.minLength(3)],
        [this.usernameAsyncValidator.bind(this)]  // ⭐ Async validator
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['',
        [Validators.required, Validators.email],
        [this.emailAsyncValidator.bind(this)]  // ⭐ Async validator
      ],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    this.isEditMode = !!this.employeeId;

    if (this.isEditMode) {
      this.loadEmployee();
      // ⭐ ในโหมด edit ไม่บังคับต้องใส่ password ใหม่
      this.staffForm.get('password')?.clearValidators();
      this.staffForm.get('password')?.setValidators([Validators.minLength(6)]);
      this.staffForm.get('password')?.updateValueAndValidity();
    }

    this.staffForm.get('empType')?.valueChanges.subscribe(value => {
      this.handleEmpTypeChange(value);
    });
  }

  // ⭐ Async Validator สำหรับ username
  usernameAsyncValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    return control.valueChanges.pipe(
      debounceTime(500),  // รอ 500ms หลังจากผู้ใช้พิมพ์เสร็จ
      switchMap(value =>
        this.employeeService.checkUsernameExists(value, this.employeeId || undefined).pipe(
          map(result => result.exists ? { usernameTaken: true } : null),
          catchError(() => of(null))
        )
      ),
      first()
    );
  }

  // ⭐ Async Validator สำหรับ email
  emailAsyncValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    return control.valueChanges.pipe(
      debounceTime(500),  // รอ 500ms หลังจากผู้ใช้พิมพ์เสร็จ
      switchMap(value =>
        this.employeeService.checkEmailExists(value, this.employeeId || undefined).pipe(
          map(result => result.exists ? { emailTaken: true } : null),
          catchError(() => of(null))
        )
      ),
      first()
    );
  }

  loadEmployee(): void {
    if (this.employeeId) {
      this.employeeService.getEmployeeById(this.employeeId).subscribe({
        next: (employee) => {
          this.staffForm.patchValue({
            empName: employee.empName,
            empAddress: employee.empAddress,
            empPhone: employee.empPhone,
            empType: employee.empType,
            dailyWage: employee.dailyWage,
            monthlySalary: employee.monthlySalary,
            role: employee.role,
            username: employee.username,
            email: employee.email,
            status: employee.status
          });
          this.handleEmpTypeChange(employee.empType);
        },
        error: (error) => {
          console.error('Error loading employee:', error);
          alert('ไม่สามารถโหลดข้อมูลพนักงานได้');
        }
      });
    }
  }

  handleEmpTypeChange(empType: string): void {
    const dailyWageControl = this.staffForm.get('dailyWage');
    const monthlySalaryControl = this.staffForm.get('monthlySalary');

    if (empType === 'DAILY') {
      dailyWageControl?.enable();
      dailyWageControl?.setValidators([Validators.required, Validators.min(0)]);
      monthlySalaryControl?.disable();
      monthlySalaryControl?.clearValidators();
      monthlySalaryControl?.setValue(null);
    } else if (empType === 'MONTHLY') {
      monthlySalaryControl?.enable();
      monthlySalaryControl?.setValidators([Validators.required, Validators.min(0)]);
      dailyWageControl?.disable();
      dailyWageControl?.clearValidators();
      dailyWageControl?.setValue(null);
    } else {
      dailyWageControl?.disable();
      monthlySalaryControl?.disable();
      dailyWageControl?.clearValidators();
      monthlySalaryControl?.clearValidators();
    }
    dailyWageControl?.updateValueAndValidity();
    monthlySalaryControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.staffForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const employee: Employee = this.staffForm.getRawValue();

      // ⭐ ถ้าในโหมด edit และไม่ได้เปลี่ยน password ให้ลบ password ออก
      if (this.isEditMode && !employee.password) {
        delete employee.password;
      }

      if (this.isEditMode && this.employeeId) {
        this.employeeService.updateEmployee(this.employeeId, employee).subscribe({
          next: () => {
            alert('อัพเดทข้อมูลพนักงานสำเร็จ!');
            this.router.navigate(['/staff']);
          },
          error: (error) => {
            console.error('Error updating employee:', error);
            const errorMessage = error.error?.error || 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล';
            alert(errorMessage);
            this.isSubmitting = false;
          }
        });
      } else {
        this.employeeService.createEmployee(employee).subscribe({
          next: () => {
            alert('เพิ่มพนักงานสำเร็จ!');
            this.router.navigate(['/staff']);
          },
          error: (error) => {
            console.error('Error adding employee:', error);
            const errorMessage = error.error?.error || 'เกิดข้อผิดพลาดในการเพิ่มพนักงาน';
            alert(errorMessage);
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.staffForm.controls).forEach(key => {
      const control = this.staffForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/staff']);
  }

  generateUsername(): void {
    const empName = this.staffForm.get('empName')?.value;
    if (empName) {
      const username = empName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
      this.staffForm.get('username')?.setValue(username);
    }
  }

  // ⭐ Helper methods สำหรับ template
  get usernameControl() {
    return this.staffForm.get('username');
  }

  get emailControl() {
    return this.staffForm.get('email');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.staffForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldPending(fieldName: string): boolean {
    const field = this.staffForm.get(fieldName);
    return field?.pending || false;
  }
}
