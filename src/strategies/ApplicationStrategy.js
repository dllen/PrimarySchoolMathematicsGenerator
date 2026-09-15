import { BandAwareStrategy } from './BandAwareStrategy.js';

export class ApplicationStrategy extends BandAwareStrategy {
  constructor(config) { super(config, { type: 'application' }); }
}
