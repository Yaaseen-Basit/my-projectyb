import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TweetfeedybComponent } from './tweetfeedyb.component';

describe('TweetfeedybComponent', () => {
  let component: TweetfeedybComponent;
  let fixture: ComponentFixture<TweetfeedybComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TweetfeedybComponent]
    });
    fixture = TestBed.createComponent(TweetfeedybComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
