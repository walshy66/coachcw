import { FastifyError, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { ServiceError } from '../../services/errors';

type ServiceErrorPayload = {
  code: string;
  message: string;
  correlationId: string;
};

function normalizeError(error: FastifyError | ServiceError): { statusCode: number; payload: ServiceErrorPayload } {
  const serviceError = error as ServiceError;
  const statusCode = serviceError.statusCode ?? error.statusCode ?? 500;
  const code = serviceError.code ?? (statusCode >= 500 ? 'SERVICE_UNAVAILABLE' : 'BAD_REQUEST');
  const message = statusCode >= 500 ? 'Service is unavailable right now.' : error.message;

  return {
    statusCode,
    payload: {
      code,
      message,
      correlationId: ''
    }
  };
}

async function errorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error, request, reply) => {
    const { statusCode, payload } = normalizeError(error);
    const enriched = {
      ...payload,
      correlationId: request.id
    };

    request.log.error({ err: error, correlationId: request.id }, 'Request failed');
    reply.status(statusCode).send({ error: enriched });
  });
}

export default fp(errorHandler, {
  name: 'error-handler-plugin'
});
