//
// Test for various transformation functions in isolation
//

import { expect } from 'chai';
import { ValueTransform } from '../src/types';
import { asNumber, asBoolean, split, map, trim } from '../src/transforms';

describe('transforms', function () {
  describe('asNumber', function () {
    it('should convert string to number', function () {
      const value: any = asNumber(undefined, undefined, '12');
      expect(typeof value).to.equal('number');
      expect(value).to.equal(12);
    });
  });

  describe('asBoolean', function () {
    it('should convert true string to true', function () {
      expect(asBoolean(undefined, undefined, 'true')).to.be.true;
    });

    it('should be case insensitive for true values', function () {
      expect(asBoolean(undefined, undefined, 'TrUe')).to.be.true;
    });

    it('should convert everything else as false', function () {
      expect(asBoolean(undefined, undefined, 'false')).to.be.false;
      expect(asBoolean(undefined, undefined, 'no')).to.be.false;
      expect(asBoolean(undefined, undefined, 'yes')).to.be.false;
      expect(asBoolean(undefined, undefined, '')).to.be.false;
    });
  });

  describe('split', function () {
    it('should split on given character into array', function () {
      const result: string[] = split(',')(undefined, 'anyPropName', 'a,b,cd,ef');
      expect(result).to.eql(['a', 'b', 'cd', 'ef']);
    });

    it('should result in one arg array if no separators in source', function () {
      const result: string = split(',')(undefined, 'anyPropName', 'no commas here');
      expect(result).to.eql(['no commas here']);
    });
  });

  describe('map', function () {
    it('should run transform over array', async function () {
      const result: any[] = await map(asNumber)(undefined, 'anyPropName', ['1', '34', '42']);
      expect(result).to.eql([1, 34, 42]);
    });

    it('should pass target and propname through to transform', async function () {
      const mapper: ValueTransform = map((target?: any, propName?: string, value?: any): any => ({ target, propName, value }));
      const target = { targetValue: 17 };
      const result: any[] = await mapper(target, 'aprop', ['a', 'b']);
      expect(result).to.eql([
        {
          value: 'a',
          target: target,
          propName: 'aprop'
        },
        {
          value: 'b',
          target: target,
          propName: 'aprop'
        }
      ]);
    });
  });

  describe('trim', function () {
    it('should remove leading and trailing whitespace', function () {
      expect(trim()(undefined, 'anyPropName', '  this is extra stuff  \n   ')).to.equal('this is extra stuff');
      expect(trim()(undefined, 'anyPropName', 'this just has trailing whitespace  \t  ')).to.equal('this just has trailing whitespace');
      expect(trim()(undefined, 'anyPropName', '    leading whitespace')).to.equal('leading whitespace');
      expect(trim()(undefined, 'anyPropName', 'trailing newlines must go\n')).to.equal('trailing newlines must go');
    });

    it('should not affect strings without leading or trailing whitespace', function () {
      expect(trim()(undefined, 'anyPropName', 'no trim needed here')).to.equal('no trim needed here');
    });
  });
});
