import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterPComponent } from './ajouter-p.component';

describe('AjouterPComponent', () => {
  let component: AjouterPComponent;
  let fixture: ComponentFixture<AjouterPComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjouterPComponent]
    });
    fixture = TestBed.createComponent(AjouterPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
