import { logger } from './logger';

export type MetricPayload = {
  name: string;
  value: number;
  unit?: string;
  dimensions?: Record<string, string | number>;
};

export function emitMetric(metric: MetricPayload) {
  logger.info(
    {
      metric: {
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        dimensions: metric.dimensions
      }
    },
    'metric_event'
  );
}
