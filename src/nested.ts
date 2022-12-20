//
// Decorator that loads nested object from configuration
//

import { ConfigProvider, ValueTransform, KeyInfo, KeyLoader, PropertyDecorator } from './types';
import { setKeyInfo } from './metadata';
import { loadConfiguration, loadConfigurationSync } from './load-configuration';

function nestedLoader(subObjectType: {new (): any}): KeyLoader {
  const loader: any = function loader(config: ConfigProvider, sync: boolean = false): Promise<any> | any {
    const subObject: any = new subObjectType();
    if (sync) {
      loadConfigurationSync(subObject, config);
      return subObject;
    } else {
      return loadConfiguration(subObject, config)
      .then(() => subObject);
    }
  };

  loader.configKey = null;
  return loader;
}

export function nested(subObjectType: {new (): any}, ...transforms: ValueTransform[]): PropertyDecorator {
  return function nestedDecorator(proto: any, propName: string) {
    setKeyInfo(proto, {
      propertyName: propName,
      loader: nestedLoader(subObjectType),
      transformers: transforms
    });
  };
}
