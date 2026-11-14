import { describe, expect, it } from 'vitest';
import * as VuePackage from '../src';

describe('@pastweb/vue root exports', () => {
  it('exposes the public Vue APIs', () => {
    expect(VuePackage.AsyncComponent).toBeTypeOf('object');
    expect(VuePackage.computed).toBeTypeOf('function');
    expect(VuePackage.createEntry).toBeTypeOf('function');
    expect(VuePackage.createMicroStore).toBeTypeOf('function');
    expect(VuePackage.createServerEntry).toBeTypeOf('function');
    expect(VuePackage.EntryAdapter).toBeTypeOf('object');
    expect(VuePackage.Remote).toBeTypeOf('object');
    expect(VuePackage.reuseColorScheme).toBeTypeOf('function');
    expect(VuePackage.reuseMicroStore).toBeTypeOf('function');
    expect(VuePackage.reuseMatchDevice).toBeTypeOf('function');
    expect(VuePackage.useMatchDevice).toBeTypeOf('function');
    expect(VuePackage.useColorScheme).toBeTypeOf('function');
    expect(VuePackage.useMediator).toBeTypeOf('function');
    expect(VuePackage.installWindowManager).toBeTypeOf('function');
    expect(VuePackage.useWindowManager).toBeTypeOf('function');
    expect(VuePackage.withDefaultProps).toBeTypeOf('function');
  });
});
