import { expect } from 'chai';

import { KeyInfo, OptionalInfo, OptionalInfos, ValueTransform, ConfigProvider } from '../src/types';
import { loadConfigurationSync } from '../src/load-configuration';
import { scalarLoader } from '../src/key';
import { KeyInfoSymbol } from '../src/metadata';

describe('Sync config loader', function () {
  describe('basic settings', function () {
    const keyInfo: KeyInfo[] = [
      {
        propertyName: 'prop1',
        loader: scalarLoader('key1'),
        transformers: []
      },
      {
        propertyName: 'prop2',
        loader: scalarLoader('keythesecond'),
        transformers: []
      }
    ];

    const configSettings: any = {
      key1: 'value for key1',
      keythesecond: 'and a value for the second key'
    };

    const configProto: any = {};
    configProto[KeyInfoSymbol] = keyInfo;
    const loadedConfig: any = Object.create(configProto);

    const configProvider: ConfigProvider = {
      get(key: string) { return configSettings[key]; },
      has(key: string) { return configSettings.hasOwnProperty(key); }
    };

    before(function () {
      return loadConfigurationSync(loadedConfig, configProvider);
    });

    it('should set all values from configuration', function () {
      keyInfo.forEach((key) => {
        expect(loadedConfig[key.propertyName]).to.equal(configSettings[key.loader.configKey]);
      });
    });
  });

  describe('with transforms', function () {
    function toNumber(target: any, propName: string, value: any): number {
      return +value;
    }

    function split(splitChar: string): ValueTransform {
      return function (target: any, propName: string, value: any): string[] {
        return (value as string).split(splitChar);
      };
    }

    function titleCase(target: any, propName: string, value: any): string {
      const s: string = value.toString();
      return s.slice(0, 1).toUpperCase() + s.slice(1);
    }

    function reverse(target: any, propName: string, value: any): string {
      const s: string = value.toString();
      return s.split('').reverse().join('');
    }

    const keyInfo: KeyInfo[] = [
      {
        propertyName: 'numericProperty',
        loader: scalarLoader('key1'),
        transformers: [toNumber]
      },
      {
        propertyName: 'arrayProperty',
        loader: scalarLoader('keythesecond'),
        transformers: [split(',')]
      },
      {
        propertyName: 'multiTransformProperty',
        loader: scalarLoader('key3'),
        transformers: [titleCase, reverse]
      }
    ];

    const configSettings: any = {
      key1: '42',
      keythesecond: 'value1,value2,value3',
      key3: 'this will be reversed'
    };

    const loadedConfig: any = Object.create({ [KeyInfoSymbol]: keyInfo });

    const configProvider: ConfigProvider = {
      get(key: string) { return configSettings[key]; },
      has(key: string) { return configSettings.hasOwnProperty(key); }
    };

    before(function () {
      return loadConfigurationSync(loadedConfig, configProvider);
    });

    it('should run transform on numeric property as part of loading', function () {
      expect(typeof loadedConfig.numericProperty).to.equal('number');
      expect(loadedConfig.numericProperty).to.equal(+configSettings.key1);
    });

    it('should run transform for array property as part of loading', function () {
      expect(loadedConfig.arrayProperty).to.be.instanceof(Array);
      expect(loadedConfig.arrayProperty).to.have.length(3);
    });

    it('should run multiple transforms for property as part of loading', function () {
      expect(typeof loadedConfig.multiTransformProperty).to.equal('string');
      expect(loadedConfig.multiTransformProperty).to.equal('desrever eb lliw sihT');
    });
  });

  describe('with async transform', function () {
    function asyncTransform(target: any, prop: string, value: any): Promise<string> {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(value), 10);
      });
    }

    const keyInfo: KeyInfo[] = [
      {
        propertyName: 'asyncProperty',
        loader: scalarLoader('key4'),
        transformers: [asyncTransform]
      }
    ];

    const configSettings: any = {
      key4: 'an async value'
    };

    const loadedConfig: any = Object.create({ [KeyInfoSymbol]: keyInfo });

    const configProvider: ConfigProvider = {
      get(key: string) { return configSettings[key]; },
      has(key: string) { return configSettings.hasOwnProperty(key); }
    };

    it('should throw error for any async transforms', function () {
      expect(() => loadConfigurationSync(loadedConfig, configProvider)).to.throw;
    });
  });

});
