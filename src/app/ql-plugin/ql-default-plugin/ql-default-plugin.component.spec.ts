// src\app\ql-plugin\ql-default-plugin\ql-default-plugin.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QlDefaultPluginComponent } from './ql-default-plugin.component';

describe('QlDefaultPluginComponent', () => {
  let component: QlDefaultPluginComponent;
  let fixture: ComponentFixture<QlDefaultPluginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QlDefaultPluginComponent],
    });
    fixture = TestBed.createComponent(QlDefaultPluginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
