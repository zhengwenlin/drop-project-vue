import { computed, defineComponent, PropType, ref } from "vue"
import './visual-editor.scss'
import { VisualEditorModelValue, VisualEditorConfig, VisualEditorComponent } from './visual-editor.utils'
import { useModel } from './utils/useModel'
import { VisualEditorBlock } from './visual-editor-block'

const VisualEditor = defineComponent({
  props: {
    modelValue: {
      // 定义type属性的类型
      type: Object as PropType<VisualEditorModelValue>,
      required: true
    },
    config: {
      type: Object as PropType<VisualEditorConfig>,
      required: true,
    }
  },
  emits: {
    'update:modelValue': (val?: VisualEditorModelValue) => true
  },
  components: { VisualEditorBlock },
  setup(props, ctx) {

    const modelData = useModel(() => props.modelValue, val => ctx.emit('update:modelValue', val))

    console.log(props.config, 'config');

    const containerStyle = computed(() => {
      return {
        width: `${modelData.value.container.width}px`,
        height: `${modelData.value.container.height}px`,
      }
    })

    const menuDragger = {
      dragstart: (e: DragEvent, component: VisualEditorComponent) => {
         // e.dataTransfer对象，可以用于保存被拖拽时的数据
         // e.dataTransfer = {dropEffect}
         // dropEffect,拖拽效果
         e && e.dataTransfer?.dropEffect = 'move';
         console.log(e, component)
      }
    }
    return () => (
      <div class="visual-editor">
        <div class="visual-editor-menu">
          {props.config.componentList.map(component => (
            <div class="visual-editor-menu-item" draggable onDragstart={(e) => menuDragger.dragstart(e, component)}>
               <span class="visual-editor-menu-item-label">{component.label}</span>
               <div class="visual-editor-menu-item-content">
                   {component.preview()}
               </div>
            </div>
          ))}
        </div>
        <div class="visual-editor-head">
          visual-editor-head
                 </div>
        <div class="visual-editor-operator">
          visual-editor-operator
                </div>
        <div class="visual-editor-body">
          <div class="visual-editor-content">
            <div class="visual-editor-container" style={containerStyle.value}>
              {!!modelData.value && !!modelData.value.blocks && (
                modelData.value.blocks.map((block, index) => (
                  <VisualEditorBlock block={block} key={index} />
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    )
  }
})

export default VisualEditor;