import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterResultatComponent } from './ajouter-resultat.component';

describe('AjouterResultatComponent', () => {
  let component: AjouterResultatComponent;
  let fixture: ComponentFixture<AjouterResultatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjouterResultatComponent]
    });
    fixture = TestBed.createComponent(AjouterResultatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
