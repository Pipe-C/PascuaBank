import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiNotFoundResponse, ApiUnprocessableEntityResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@ApiTags('Cuentas Bancarias')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtener información de la cuenta e historial de transacciones' })
  @ApiResponse({ status: 200, description: 'Detalle de la cuenta bancaria devuelto exitosamente.' })
  @ApiNotFoundResponse({ description: 'La cuenta bancaria solicitada no fue encontrada.' })
  async getAccount(@Param('id') accountId: string) {
    return this.accountsService.getAccount(accountId);
  }

  @Post(':id/deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consignar fondos en una cuenta bancaria' })
  @ApiResponse({ status: 200, description: 'Consignación realizada con éxito.' })
  @ApiBadRequestResponse({ description: 'Monto inválido o datos mal formateados.' })
  @ApiNotFoundResponse({ description: 'La cuenta bancaria solicitada no fue encontrada.' })
  async deposit(
    @Param('id') accountId: string,
    @Body() dto: DepositDto,
  ) {
    return this.accountsService.deposit(accountId, dto.amount);
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retirar fondos de una cuenta bancaria' })
  @ApiResponse({ status: 200, description: 'Retiro realizado con éxito.' })
  @ApiBadRequestResponse({ description: 'Monto inválido o datos mal formateados.' })
  @ApiUnprocessableEntityResponse({ description: 'Saldo insuficiente para completar el retiro.' })
  @ApiNotFoundResponse({ description: 'La cuenta bancaria solicitada no fue encontrada.' })
  async withdraw(
    @Param('id') accountId: string,
    @Body() dto: WithdrawDto,
  ) {
    return this.accountsService.withdraw(accountId, dto.amount);
  }
}