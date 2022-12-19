import { expect } from 'chai';
import config from 'config';

import { Settings } from './Settings';

import { loadConfigurationSync } from '../../src/load-configuration';

describe('Load config with config', function () {
  it('loads config', () => {
    const settings = new Settings();
    loadConfigurationSync(settings, config);

    expect(settings.configKey).to.equal('value');
  });
});
