import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockDocumentWidget } from './stock-document-widget';

describe('StockDocumentWidget', () => {
  let component: StockDocumentWidget;
  let fixture: ComponentFixture<StockDocumentWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockDocumentWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockDocumentWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
