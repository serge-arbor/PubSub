const { MetricServiceClient } = require('@google-cloud/monitoring');

class MetricsHelper {
  constructor(pubSubClient, projectId) {
    this.projectId = projectId;
    this.metricsClient = new MetricServiceClient(pubSubClient);
  }

  async fetchMetricSingleValue(
    subscriptionName, 
    metricType, 
    intervalSeconds = 60, 
    aggregationAligner = 'ALIGN_MEAN'
  ) {
    try {
      const request = {
        name: this.metricsClient.projectPath(this.projectId),
        filter: `metric.type="${metricType}" resource.labels.subscription_id="${subscriptionName}"`,
        interval: {
          startTime: {
            seconds: Math.floor(Date.now() / 1000) - intervalSeconds,
          },
          endTime: {
            seconds: Math.floor(Date.now() / 1000),
          },
        },
        aggregation: {
          alignmentPeriod: {
            seconds: intervalSeconds,
          },
          perSeriesAligner: aggregationAligner,
        },
      };

      const [response] = await this.metricsClient.listTimeSeries(request);

      if (response.length === 0) {
        console.log(`${metricType}. No data found for the metric.`);
        return null;
      }

      const latestValue = response[0].points[0].value;

      const result = (() => {
        switch (aggregationAligner) {
          case 'ALIGN_MEAN':
            return latestValue.doubleValue;
          case 'ALIGN_SUM':
            return latestValue.distributionValue.mean;
          case 'ALIGN_COUNT':
            return latestValue.int64Value;
          default:
            console.error(`Aggregation aligner '${aggregationAligner}' not supported.`);
          return null; // or any other default value you want to assign
        }
      })();
      console.log(`${metricType}. Latest metric value: ${result}`);
      return result;
    } catch (error) {
      console.error('Error occurred while fetching the metric:', error);
    }
  }
}

module.exports = MetricsHelper;
