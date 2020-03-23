import config from './config';
import { Selector, Role, ClientFunction } from 'testcafe';

export const testIfBackendModuleExists = (
  testName,
  backendModuleName,
  testToRun,
) => {
  if (config.backendModules.includes(backendModuleName)) {
    test(testName, testToRun);
  } else {
    test.skip(testName, testToRun);
  }
};

export async function getIframe() {
  return Selector('.iframeContainer')
    .child('iframe')
    .filterVisible();
}

export const address = `${
  config.localdev ? 'http://console-dev' : 'https://console'
}.${config.domain}`;

export const adminUser = Role(
  address,
  async t => {
    await t
      .typeText('#login', config.login)
      .typeText('#password', config.password)
      .click('#submit-login');
    await waitForAuthInStorage(3000, getPathname(t));
  },
  { preserveUrl: true },
);

const getPathname = t =>
  ClientFunction(() => window.location.pathname).with({
    boundTestRun: t,
  });

export async function waitForAuthInStorage(
  maxTimeout,
  getPathnameFn,
  checkInterval = 100,
) {
  const timeoutPromise = new Promise((resolve, reject) =>
    setTimeout(function() {
      reject(new Error('Login response timeout exceeded')); //TODO
    }, maxTimeout),
  );
  const keyInStoragePromise = new Promise(async (resolve, reject) =>
    setInterval(async () => {
      const pathname = await getPathnameFn();
      if (pathname === '/home/workspace') resolve();
    }, checkInterval),
  );
  return Promise.race([timeoutPromise, keyInStoragePromise]);
}
