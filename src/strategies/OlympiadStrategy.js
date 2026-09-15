import { BandAwareStrategy } from './BandAwareStrategy.js';

export class OlympiadStrategy extends BandAwareStrategy {
  constructor(config) { super(config, { type: 'olympiad' }); }
}
