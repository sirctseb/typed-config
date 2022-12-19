import { key } from '../../src/key';

export class Settings {
  @key('configKey')
  public configKey!: string;
}
