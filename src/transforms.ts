//
// Various transform functions useful in loading configuration.
//

import { ValueTransform } from './types';

//
// Type converters
//

export function asNumber(obj?: any, name?: string, value?: any): number {
  let val = value;
  if (val instanceof Number || val instanceof String) {
    val = val.valueOf();
  }

  if (typeof val === 'number') {
    return val;
  }
  if (typeof val === 'string') {
    return +val;
  }

  throw new Error(`'${value}' cannot be converted to 'number'`);
}

export function asBoolean(obj?: any, name?: string, value?: any): boolean {
  let val = value;
  if (val instanceof Boolean || val instanceof Number || val instanceof String) {
    val = val.valueOf();
  }

  if (typeof val === 'boolean') {
    return val;
  }
  if (typeof val === 'number') {
    if (val === 1) {
      return true;
    }
    if (val === 0) {
      return false;
    }
  }
  if (typeof val === 'string') {
    return val.toLowerCase() === 'true';
  }

  throw new Error(`'${value}' cannot be converted to 'boolean'`);
}

//
// Split into an array of strings
//
export function split(splitChar: string): ValueTransform {
  return function split(obj?: any, name?: string, value?: any): string[] {
    let val = value;
    if (val instanceof String) {
      val = val.valueOf();
    }

    if (typeof val === 'string') {
      return val.split(splitChar);
    }

    throw new Error(`'${value}' cannot be splitted`);
  };
}

//
// Trim leading and trailing whitespace from a string value
//
export function trim(): ValueTransform {
  return function trim(obj?: any, name?: string, value?: any): string {
    let val = value;
    if (val instanceof String) {
      val = val.valueOf();
    }

    if (typeof val === 'string') {
      return val.trim();
    }

    throw new Error(`'${value}' cannot be trimed`);
  };
}

//
// Map a single transformation function over an array of values
//
export function map(transform: ValueTransform): ValueTransform {
  return function mapTransform(target: any, propName: string, values: any[]): Promise<any> {
    let result = Promise.resolve([]);
    values.forEach((value: any) => {
      result = result.then((results) =>
        Promise.resolve(transform(target, propName, value))
        .then((result) => results.concat(result)));
    });
    return result;
  };
}
