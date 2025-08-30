import { OptionalJwtGuard } from './optional-jwt.guard';

describe('OptionalJwtGuard', () => {
  it('should be defined', () => {
    expect(new OptionalJwtGuard()).toBeDefined();
  });
});
