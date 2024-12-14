import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FireflyComponent } from './firefly.component';

describe('FireflyComponent', () => {
  let component: FireflyComponent;
  let fixture: ComponentFixture<FireflyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FireflyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FireflyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
