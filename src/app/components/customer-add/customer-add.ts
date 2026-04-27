import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService, Customer } from '../../services/customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './customer-add.html',
  styleUrl: './customer-add.css'
})
export class CustomerAddComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode: boolean = false;
  customerId: number | null = null;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.customerForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerAddress: ['', [Validators.required, Validators.minLength(5)]],
      customerPhone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,11}$/)]],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id') ? Number(this.route.snapshot.paramMap.get('id')) : null;
    this.isEditMode = !!this.customerId;

    if (this.isEditMode) {
      this.loadCustomer();
    }
  }

  loadCustomer(): void {
    if (this.customerId) {
      this.customerService.getCustomerById(this.customerId).subscribe({
        next: (customer) => {
          this.customerForm.patchValue({
            customerName: customer.customerName,
            customerAddress: customer.customerAddress,
            customerPhone: customer.customerPhone,
            status: customer.status || 'ACTIVE'
          });
        },
        error: (error) => {
          console.error('Error loading customer:', error);
          alert('ไม่สามารถโหลดข้อมูลลูกค้าได้');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.customerForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const customer: Customer = this.customerForm.value;

      if (this.isEditMode && this.customerId) {
        this.customerService.updateCustomer(this.customerId, customer).subscribe({
          next: () => {
            alert('อัพเดทข้อมูลลูกค้าสำเร็จ!');
            this.router.navigate(['/customers']);
          },
          error: (error) => {
            console.error('Error updating customer:', error);
            alert('เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
            this.isSubmitting = false;
          }
        });
      } else {
        this.customerService.createCustomer(customer).subscribe({
          next: () => {
            alert('เพิ่มลูกค้าสำเร็จ!');
            this.router.navigate(['/customers']);
          },
          error: (error) => {
            console.error('Error adding customer:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มลูกค้า');
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
