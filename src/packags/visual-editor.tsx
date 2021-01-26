import { computed, defineComponent, PropType, ref } from "vue"
import './visual-editor.scss'
import { VisualEditorModelValue, VisualEditorConfig, VisualEditorComponent, createNewBlock, VisualEditorBlockData } from './visual-editor.utils'
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
          let blocks = modelData.value.blocks;
          blocks.push(createNewBlock({
            component: current!,
            top: e.offsetY,
            left: e.offsetX,
          }))
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
    
    // 定义一些方法
    const methods = {
      clearFocus: (block?: VisualEditorBlockData) => {
         let blocks = modelData.value.blocks || [];
         if(blocks.length === 0) return;
         if(block){
           blocks = blocks.filter(b => b !== block)
         }
         blocks.forEach(b => b.focus = false)
      }
    }

    // block的激活的handlers
    // 1. 点击block，变成激活状态
    // 2. 按住shift键，点击其他block，多选
    // 3. 不按住shift，点击其他block，只选中当前的block，其他不选中
    // 4. 点击container，所有的block取消选中
    const focusHandlers = (() => {
      return {
        // 监听container的mousedown，让所有的block取消激活状态
        container: {
          onMousedown: (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation()
            methods.clearFocus()
          }
        },
        // 监听block的mousedown，让block激活
        block: {
          // 比click事件更快
          onMousedown: (e: MouseEvent, block: VisualEditorBlockData) => {
            // 阻止默认事件和冒泡，否则会冒泡到container，这样就不对了
            e.preventDefault();
            e.stopPropagation()
            // 判断用户是否按住了shift键
            // e.shiftKey 事件属性可返回一个布尔值，指示当事件发生时，"SHIFT" 键是否被按下并保持住。
            if(e.shiftKey){ // 多选
               // 正常选中即可
               block.focus = !block.focus;
            }else{
              // 没有按住的话，要选中当前的，其他的block都取消选中
              block.focus = !block.focus;
              methods.clearFocus(block)
            }
          }
        }
      }
    })();


    // block的拖拽handlers
    // block的拖拽用的是mouse事件，没有使用drag事件，原因是mouse支持拖拽的时候用滚轮滚动滚动条
    const blockDraggier = (() => {
      // 用于保存拖拽的一些信息
      let dragState = {
        
      }

      const mousedown = (e: MouseEvent) => {

      }
      const mousemove = (e: MouseEvent) => {

      }
      const mouseup = (e: MouseEvent) => {

      }
      return mousedown;
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
            <div
              class="visual-editor-container"
              style={containerStyle.value}
              {
              ...focusHandlers.container
              }
            >
              {!!modelData.value && !!modelData.value.blocks && (
                modelData.value.blocks.map((block, index) => (
                  // vue3给组件添加事件，会被添加到渲染的跟元素上
                  // onMousedown={(e: MouseEvent) => focusHandlers.block.onMousedown(e, block)}
                  <VisualEditorBlock
                    config={props.config}
                    block={block}
                    key={index}
                    {...{
                      onMousedown: (e: MouseEvent) => focusHandlers.block.onMousedown(e, block)
                    }}
                  />
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