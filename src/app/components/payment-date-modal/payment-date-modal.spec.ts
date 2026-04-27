import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentDateModal } from './payment-date-modal';

describe('PaymentDateModal', () => {
  let component: PaymentDateModal;
  let fixture: ComponentFixture<PaymentDateModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentDateModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentDateModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
