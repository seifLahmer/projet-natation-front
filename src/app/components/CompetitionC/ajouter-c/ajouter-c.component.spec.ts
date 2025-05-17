import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterCComponent } from './ajouter-c.component';

describe('AjouterCComponent', () => {
  let component: AjouterCComponent;
  let fixture: ComponentFixture<AjouterCComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjouterCComponent]
    });
    fixture = TestBed.createComponent(AjouterCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
