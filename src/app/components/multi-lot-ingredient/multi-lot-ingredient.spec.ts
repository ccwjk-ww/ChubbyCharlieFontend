import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiLotIngredient } from './multi-lot-ingredient';

describe('MultiLotIngredient', () => {
  let component: MultiLotIngredient;
  let fixture: ComponentFixture<MultiLotIngredient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiLotIngredient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiLotIngredient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
