import { computed, defineComponent, PropType, ref } from "vue"
import './visual-editor.scss'
import { VisualEditorModelValue, VisualEditorConfig, VisualEditorComponent, createNewBlock, VisualEditorBlockData } from './visual-editor.utils'
import { useModel } from './utils/useModel'
import { VisualEditorBlock } from './visual-editor-block'
import { useVisualCommander } from "./utils/visual.command"

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

    const dataModel = useModel(() => props.modelValue, val => ctx.emit('update:modelValue', val))

    const containerStyle = computed(() => {
      return {
        width: `${dataModel.value.container.width}px`,
        height: `${dataModel.value.container.height}px`,
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
          let blocks = dataModel.value.blocks;
          blocks.push(createNewBlock({
            component: current!,
            top: e.offsetY,
            left: e.offsetX,
          }))
          // 这个dataModel随便改，内部监听好了
          dataModel.value = {
            ...dataModel.value,
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
        let blocks = dataModel.value.blocks || [];
        if (blocks.length === 0) return;
        if (block) {
          blocks = blocks.filter(b => b !== block)
        }
        blocks.forEach(b => b.focus = false)
      },
      // 更新bloack数据的方法
      updateBlocks: (blocks?: VisualEditorBlockData[]) => {
         dataModel.value = {
           ...dataModel.value,
           blocks: blocks || []
         }
      }
    }

    // 计算选中和未选中的block的数据
    const focusData = computed(() => {
      let focus = [] as VisualEditorBlockData[];
      let unFocus = [] as VisualEditorBlockData[];
      let blocks = dataModel.value.blocks;

      blocks.forEach(b => {
        (b.focus ? focus : unFocus).push(b)
      })
      return {
        focus,         // 选中的数据
        unFocus        // 未选中的数据
      }
    })

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
            if (e.shiftKey) { // 多选
              // 如果是只有一个选中或者没有选中的
              if(focusData.value.focus.length <= 1){
                block.focus = true; // 设置选中
              }else{
                block.focus = !block.focus;
              }
            } else {
              if(!block.focus){
                // 如果当前的block是没有选中的状态，点击的时候才会去清空别的block的选中状态
                // 如果当前的block是选中状态，点击的时候不会影响别的block的选中状态
                block.focus = true;
                methods.clearFocus(block)
              }
            }

            // block拖拽事件
            blockDraggier.mousedown(e)
          }
        }
      }
    })();


    // block的拖拽handlers
    // block的拖拽用的是mouse事件，没有使用drag事件，原因是mouse支持拖拽的时候用滚轮滚动滚动条
    const blockDraggier = (() => {
      // 用于保存初始的一些信息
      let dragState = {
        startX: 0,
        startY: 0,
        // 要拖拽的元素可能有多个，（选中的blocks都要被拖拽）
        startPos: [] as { left: number, top: number }[]
      }
      // clientX,clientY 点击位置距离当前body可视区域的x、y坐标
      // 鼠标按下时触发的事件
      const mousedown = (e: MouseEvent) => {
        console.log(e, 'e');
        
        dragState = {
          startX: e.clientX,
          startY: e.clientY,
          // 选中的blocks的起始left和top值
          startPos: focusData.value.focus.map(({ left, top }) => ({ left, top }))
        }
        // 添加mousemove事件mouseup事件
        // 注意： 事件要绑定给document，因为元素是在页面中随便移动，相对于document
        document.addEventListener('mousemove', mousemove)
        document.addEventListener('mouseup', mouseup)
      }
      // 鼠标移动时触发的事件
      const mousemove = (e: MouseEvent) => {
        // 鼠标移动的时候，计算位置
        let durX = e.clientX - dragState.startX;
        let durY = e.clientY - dragState.startY;
        focusData.value.focus.forEach((block, index) => {
           block.top = dragState.startPos[index].top + durY;
           block.left = dragState.startPos[index].left + durX;
        })

      }
      // 鼠标抬起时触发的事件
      const mouseup = (e: MouseEvent) => {
        // 移除相关事件
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseup)
      }
      return {
        mousedown
      };
    })();
    
    // 获取commander对象
    const commander = useVisualCommander({
      focusData, 
      dataModel, 
      updateBlocks:methods.updateBlocks
    })
    // 先把按钮渲染出来
    const buttons = [
      {
        label: '撤销',
        icon: 'icon-back',
        handler: commander.undo,
        tip: 'ctrl+z'
      },
      {
        label: '重做',
        icon: 'icon-forward',
        handler: commander.redo,
        tip: 'ctrl+y, ctrl+shift+z'
      },
      {
        label: '删除',
        icon: 'icon-back',
        handler: commander.delete,
        tip: 'ctrl+d, backspace, delete'
      }
    ]

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
           {
             buttons.map((btn, index) => {
               let content = (
                <div class="visual-editor-head-button" onClick={() => btn.handler()}>
                    <i class={`iconfont ${btn.icon}`}></i>
                    <span>{btn.label}</span>
                </div>
               )
               return !btn.tip ? content:  <el-tooltip effect="dark" content={btn.tip} placement="bottom">
                 {content}
               </el-tooltip>; 
             })
           }
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
              {!!dataModel.value && !!dataModel.value.blocks && (
                dataModel.value.blocks.map((block, index) => (
                  // vue3给组件添加事件，会被添加到渲染的跟元素上
                  // onMousedown={(e: MouseEvent) => focusHandlers.block.onMousedown(e, block)}
                  <VisualEditorBlock
                    config={props.config}
                    block={block}
                    key={index}
                    {...{
                      onMousedown: (e: MouseEvent) => focusHandlers.block.onMousedown(e, block),
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