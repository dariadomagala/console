import { Selector } from 'testcafe';

import { testIf, getIframe, ADRESS, adminUser, toBoolean } from '../helpers';
import config from '../config';

fixture`ServiceCatalog`.page(ADRESS);

test('Catalog view is rendered', async t => {
  await t
    .useRole(adminUser)
    .navigateTo(`${ADRESS}/home/namespaces/default/cmf-service-catalog`);

  const iframe = await getIframe();
  await t
    .expect(Selector('.fd-side-nav__link').withText('Catalog').exists)
    .ok()
    .switchToIframe(iframe)
    .expect(
      Selector('.fd-action-bar__title').withText('Service Catalog').exists,
    )
    .ok();
});
