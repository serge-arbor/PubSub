const k8s = require('@kubernetes/client-node');

class KubeHelper {
  constructor() {
    this.kc = new k8s.KubeConfig();
  }

  async getPodCountForService(namespace, serviceName) {
    this.kc.loadFromDefault();
  
    const k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
  
    try {
      const service = await k8sApi.readNamespacedService(serviceName, namespace);
  
      if (!service || !service.body) {
        console.log(`Service '${serviceName}' not found in namespace '${namespace}'.`);
        return;
      }
  
      const selector = service.body.spec.selector;
      const labelSelector = Object.entries(selector)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');
  
      const podList = await k8sApi.listNamespacedPod(namespace, undefined, undefined, undefined, undefined, labelSelector);
      const podCount = podList.body.items.length;
  
      console.log(`Number of pods for service '${serviceName}' in namespace '${namespace}': ${podCount}`);

      return podCount;
    } catch (error) {
      console.error('Error occurred while retrieving pod count:', error);
    }
  }
  
    
}

module.exports = KubeHelper;
