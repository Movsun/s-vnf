import { Test, TestingModule } from '@nestjs/testing';
import { ManoService } from './mano.service';

describe('ManoService', () => {
  let service: ManoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManoService],
    }).compile();

    service = module.get<ManoService>(ManoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
