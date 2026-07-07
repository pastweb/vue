<script lang="ts">
  import { defineComponent, isVNode, cloneVNode, h } from 'vue';
  import type { RenderProps } from './types';

  /**
   * Renders primitive content, Vue VNodes, or Vue component definitions through
   * a single component API.
   */
  export default defineComponent<RenderProps>({
    props: {
      /**
       * The content to render. Can be a string/number (renders as text),
       * a VNode (cloned with additional props), or a component definition
       * (rendered with additional props).
       * @type {string | number | VNode | Component}
       */
      content: {
        type: [String, Number, Object],
        required: true
      },
      /**
       * Additional props to apply to the rendered content.
       * For VNodes, these are merged via cloning. For components,
       * they are passed directly. Ignored for primitive content.
       * @type {Record<string, any>}
       */
      props: {
        type: Object,
        default: () => ({})
      }
    },
    setup(props) {
      const renderContent = () => {
        const { content, props: _props = {} } = props;

        if (typeof content === 'string' || typeof content === 'number') {
          return content;
        }

        if (isVNode(content)) {
          return cloneVNode(content, _props);
        }

        return h(content as any, _props);
      };

      return renderContent;
    }
  });
</script>
