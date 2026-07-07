import { computed as vueComputed, nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { computed } from '../../src/computed';

describe('computed', () => {
  it('returns a Vue computed ref', () => {
    const value = computed(() => 1 + 1);

    expect(value.value).toBe(2);
  });

  it('tracks Vue refs like Vue computed', async () => {
    const count = ref(1);
    const doubled = computed(() => count.value * 2);

    expect(doubled.value).toBe(2);

    count.value = 2;
    await nextTick();

    expect(doubled.value).toBe(4);
  });

  it('memoizes until a dependency changes', () => {
    const count = ref(1);
    const fn = vi.fn(() => ({ value: count.value }));
    const result = computed(fn);
    const firstValue = result.value;

    expect(result.value).toBe(firstValue);
    expect(fn).toHaveBeenCalledTimes(1);

    count.value = 2;

    expect(result.value).toEqual({ value: 2 });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('matches Vue computed behavior for complex values', () => {
    const users = ref([
      { id: 1, active: true },
      { id: 2, active: false },
      { id: 3, active: true },
    ]);
    const activeUsers = computed(() => users.value.filter(user => user.active));
    const vueActiveUsers = vueComputed(() => users.value.filter(user => user.active));

    expect(activeUsers.value).toEqual(vueActiveUsers.value);
  });
});
