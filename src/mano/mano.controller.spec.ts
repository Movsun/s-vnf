import { Test, TestingModule } from '@nestjs/testing';
import { ManoController } from './mano.controller';
import { ManoService } from './mano.service';

describe('ManoController', () => {
  let controller: ManoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManoController],
      providers: [ManoService],
    }).compile();

    controller = module.get<ManoController>(ManoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
