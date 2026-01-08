import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectedDriversComponent } from './connected-drivers.component';

describe('ConnectedDriversComponent', () => {
  let component: ConnectedDriversComponent;
  let fixture: ComponentFixture<ConnectedDriversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectedDriversComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConnectedDriversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
