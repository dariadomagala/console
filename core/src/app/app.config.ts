import { environment } from '../environments/environment';
interface StringMap {
  [s: string]: string;
}

declare const INJECTED_CLUSTER_CONFIG: StringMap; // injected by webpack
const windowClusterConfig = (window as any).clusterConfig;
const clusterConfig = Object.keys(windowClusterConfig || {}).length ? windowClusterConfig : undefined;
const configToRead: StringMap = clusterConfig || (typeof INJECTED_CLUSTER_CONFIG !== 'undefined' ? INJECTED_CLUSTER_CONFIG : { domain: 'kyma.local' }); // fallback for tests

const domain = configToRead.domain;
const k8sServerUrl = `https://apiserver.${domain}`;
const gqlUrl = `https://console-backend.${domain}/graphql`
const gqlLocalUrl = `http://console-dev.${domain}:3000/graphql`
const gqlSubsUrl = `wss://console-backend.${domain}/graphql`
const gqlSubsLocalUrl = `ws://console-dev.${domain}:3000/graphql`

const config = {
  authIssuer: `https://dex.${domain}`,
  k8sServerUrl,
  k8sApiServerUrl: `${k8sServerUrl}/api/v1/`,
  k8sApiServerUrl_apimanagement: `${k8sServerUrl}/apis/gateway.kyma-project.io/v1alpha2/`,
  k8sApiServerUrl_apps: `${k8sServerUrl}/apis/apps/v1/`,
  k8sApiServerUrl_applications: `${k8sServerUrl}/apis/applicationconnector.kyma-project.io/v1alpha1/applications/`,
  k8sApiServerUrl_servicecatalog: `${k8sServerUrl}/apis/servicecatalog.k8s.io/v1beta1/`,
  graphqlApiUrl: environment.localApi ? gqlLocalUrl : gqlUrl,
  subscriptionsApiUrl: environment.localApi ? gqlSubsLocalUrl : gqlSubsUrl,

  headerTitle: '',
  headerLogoUrl: 'assets/logo.svg',
  faviconUrl: 'favicon.ico',
  kubeconfigGeneratorUrl: `https://configurations-generator.${domain}/kube-config`,
  idpLogoutUrl: null,
  runtimeAdminGroupName: 'runtimeAdmin',
  ...configToRead
};

export const AppConfig = { ...config } as any;
