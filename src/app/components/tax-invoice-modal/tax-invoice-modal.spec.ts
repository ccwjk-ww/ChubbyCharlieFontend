import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxInvoiceModal } from './tax-invoice-modal';

describe('TaxInvoiceModal', () => {
  let component: TaxInvoiceModal;
  let fixture: ComponentFixture<TaxInvoiceModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxInvoiceModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxInvoiceModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
