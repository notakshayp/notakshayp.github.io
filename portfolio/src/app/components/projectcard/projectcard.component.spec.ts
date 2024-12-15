import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectcardComponent } from './projectcard.component';

describe('ProjectcardComponent', () => {
  let component: ProjectcardComponent;
  let fixture: ComponentFixture<ProjectcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectcardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
