import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Communities } from './communities';

describe('Communities', () => {
  let component: Communities;
  let fixture: ComponentFixture<Communities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Communities],
    }).compileComponents();

    fixture = TestBed.createComponent(Communities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
