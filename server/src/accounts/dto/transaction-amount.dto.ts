
import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionAmountDto {
  @ApiProperty({
    example: 100000.0,
    description: 'Monto de la operación bancaria (mínimo $0.01)',
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser un número con máximo 2 decimales' })
  @IsPositive({ message: 'El monto debe ser un valor positivo' })
  @Min(0.01, { message: 'El monto mínimo a ingresar o retirar es 0.01' })
  amount: number;
}