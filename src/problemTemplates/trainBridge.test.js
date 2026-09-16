import { describe, it, expect } from 'vitest';
import { createRng } from '../utils/rng.js';
import { trainBridgeTemplate } from './trainBridge.js';

describe('trainBridgeTemplate', () => {
  it('has 3 subtemplates', () => { expect(trainBridgeTemplate.subtemplates.length).toBe(3); });
  it('generates valid bridge/tunnel questions', () => {
    for (const st of trainBridgeTemplate.subtemplates) {
      const r = st.generate(createRng());
      expect(r.question).toMatch(/火车|桥|隧道|车长|通过/);
      expect(r.answer).toMatch(/\d/);
      expect(r.subtype).toBe('train-bridge');
    }
  });
});
