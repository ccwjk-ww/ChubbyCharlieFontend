import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockCheckModalComponent } from './stock-check-modal';

describe('StockCheckModalComponent', () => {
  let component: StockCheckModalComponent;
  let fixture: ComponentFixture<StockCheckModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockCheckModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockCheckModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
