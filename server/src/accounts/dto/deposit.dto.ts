import { ApiSchema } from '@nestjs/swagger';
import { TransactionAmountDto } from './transaction-amount.dto';

@ApiSchema({ name: 'DepositDto', description: 'Estructura para realizar un depósito/consignación de fondos' })
export class DepositDto extends TransactionAmountDto {}