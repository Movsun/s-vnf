import { PartialType } from '@nestjs/mapped-types';
import { CreateManoDto } from './create-mano.dto';

export class UpdateManoDto extends PartialType(CreateManoDto) {}
