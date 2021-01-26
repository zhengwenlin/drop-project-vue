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

    const containerStyle = computed(() => {
      return {
        width: `${modelData.value.container.width}px`,
        height: `${modelData.value.container.height}px`,
      }
    })
    // 写成一个自执行函数，可以自己决定外部使用什么方法
    const menuDraggier = (() => {
      // 当前的组件
      let current = null as null | VisualEditorComponent;
      // block的drag事件handler
      const blockHanders = {
        // 当拖拽的元素开始拖拽时触发
        dragstart: (e: DragEvent, component: VisualEditorComponent) => {
          current = component;
          // 给目标容器添加一系列的drag事件
          window.addEventListener('dragenter', containerHanders.dragenter)
          window.addEventListener('dragover', containerHanders.dragover)
          window.addEventListener('dragleave', containerHanders.dragleave)
          window.addEventListener('drop', containerHanders.drop)
        },
        drag: (e: DragEvent) => {

        },
        dragend: (e: DragEvent) => {
          // 将目标容器的事件移除
          current = null;
          // 给目标容器添加一系列的drag事件
          window.removeEventListener('dragenter', containerHanders.dragenter)
          window.removeEventListener('dragover', containerHanders.dragover)
          window.removeEventListener('dragleave', containerHanders.dragleave)
          window.removeEventListener('drop', containerHanders.drop)
        }
      }
      // 目标容器的事件hander
      const containerHanders = {
        // 拖拽元素进入容器时触发
        dragenter: (e: DragEvent) => {
          // dropEffect = move设置拖拽效果为移动的效果 move 移动到目标
          e.dataTransfer!.dropEffect = 'move';
        },
        dragover: (e: DragEvent) => {
          // dragover事件中要阻止默认事件
          // 元素默认是不能够拖放 只要我们在目标元素的dragover事件中取消默认事件就可以解决问题
          e.preventDefault()
        },
        // 离开目标容器时触发
        dragleave: (e: DragEvent) => {
          // 设置拖拽效果是不能拖放
          e.dataTransfer!.dropEffect = 'none';
        },
        // 鼠标在容器中放下时触发
        drop: (e: DragEvent) => {
          // 添加一条数据
          console.log(current, 'current');
          let blocks = modelData.value.blocks;
          blocks.push({
            top: e.offsetY,
            left: e.offsetX,
            componentKey: current!.key,
            adjustPosition: true, // 第一次拖过去是需要调整位置的
          })
          // 这个modelData随便改，内部监听好了
          modelData.value = {
            ...modelData.value,
            blocks
          }
        }
      }
      // 导出的只想让外部访问到的属性，自己决定
      return blockHanders;
    })();
    return () => (
      <div class="visual-editor">
        <div class="visual-editor-menu">
          {props.config.componentList.map(component => (
            <div 
              class="visual-editor-menu-item" 
              draggable 
              onDragstart={(e) => menuDraggier.dragstart(e, component)}
              onDragend={menuDraggier.dragend}
            >
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
                  <VisualEditorBlock config={props.config} block={block} key={index} />
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