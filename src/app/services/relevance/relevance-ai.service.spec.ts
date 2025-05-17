import { TestBed } from '@angular/core/testing';

import { RelevanceAiService } from './relevance-ai.service';

describe('RelevanceAiService', () => {
  let service: RelevanceAiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelevanceAiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
