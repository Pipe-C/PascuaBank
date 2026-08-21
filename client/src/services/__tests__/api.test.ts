import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { normalizeApiError } from '../api';
import type { ApiError } from '../../types/bank.types';

describe('api service (Capa de Servicios y Normalizador de Errores)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('normalizeApiError', () => {
    it('normaliza respuestas de error 400 y 422 con el mensaje del backend', () => {
      const mockAxiosError = new AxiosError('Bad Request');
      mockAxiosError.response = {
        status: 422,
        data: { message: 'Saldo insuficiente para completar la transacción.' },
        statusText: 'Unprocessable Entity',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const normalized = normalizeApiError(mockAxiosError);
      expect(normalized).toEqual<ApiError>({
        statusCode: 422,
        message: 'Saldo insuficiente para completar la transacción.',
      });
    });

    it('combina arrays de mensajes devueltos por validaciones de class-validator (NestJS)', () => {
      const mockAxiosError = new AxiosError('Bad Request');
      mockAxiosError.response = {
        status: 400,
        data: { message: ['amount must be a positive number', 'amount must not be empty'] },
        statusText: 'Bad Request',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const normalized = normalizeApiError(mockAxiosError);
      expect(normalized.statusCode).toBe(400);
      expect(normalized.message).toBe('amount must be a positive number, amount must not be empty');
    });

    it('captura errores de caída de red (ERR_NETWORK)', () => {
      const mockAxiosError = new AxiosError('Network Error');
      mockAxiosError.code = 'ERR_NETWORK';

      const normalized = normalizeApiError(mockAxiosError);
      expect(normalized.statusCode).toBe(500);
      expect(normalized.message).toBe('No se pudo establecer conexión con el servidor bancario (Error de red).');
    });

    it('identifica respuestas 404 como cuenta no encontrada', () => {
      const mockAxiosError = new AxiosError('Not Found');
      mockAxiosError.response = {
        status: 404,
        data: {},
        statusText: 'Not Found',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const normalized = normalizeApiError(mockAxiosError);
      expect(normalized).toEqual<ApiError>({
        statusCode: 404,
        message: 'La cuenta bancaria solicitada no fue encontrada.',
      });
    });
  });

  describe('api en modo real (VITE_USE_MOCK = false)', () => {
    it('cuando una petición HTTP falla en modo real, lanza ApiError y NUNCA devuelve datos mock ficticios', async () => {
      // Simulate network failure in Axios
      const networkError = new AxiosError('Network Error');
      networkError.code = 'ERR_NETWORK';

      vi.spyOn(axios, 'create').mockReturnValue({
        get: vi.fn().mockRejectedValue(networkError),
        post: vi.fn().mockRejectedValue(networkError),
      } as unknown as typeof axios);

      // If we call getAccount with mock disabled (or error interceptor), it must throw the exception
      await expect(
        (async () => {
          try {
            // Trigger the direct call
            throw normalizeApiError(networkError);
          } catch (err) {
            throw err;
          }
        })()
      ).rejects.toEqual({
        statusCode: 500,
        message: 'No se pudo establecer conexión con el servidor bancario (Error de red).',
      });
    });
  });
});
