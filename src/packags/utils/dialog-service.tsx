import { defineComponent, getCurrentInstance, PropType, reactive } from "vue";
import { ElButton, ElDialog, ElInput } from 'element-plus'
/**
 * 怎么写一个dialog服务？
 * 1. 先有一个组件 
 * 2. 写一个方法用于动态挂载组件
 * 什么是组件服务 是一个函数
 *  - 就是动态的挂载组件
 */
enum DialogServiceEditType {
  textarea = 'textarea',
  text = 'text'
}
interface DialogServiceOption {
  title?: string,
  editType: DialogServiceEditType,       // text和textarea两种类型
  editReadonly?: boolean,                 // 是否只读
  editValue?: string | null,              // 修改回显的数据内容
  onConfirm: (val?: string | null) => void; // 点击确定按钮执行的方法
}

const serviceComponet = defineComponent({
  props: {
    options: {
      type: Object as PropType<DialogServiceOption>,
      required: true,
    }
  },
  setup(props) {
    // 在setup函数中获取当前组件的实例
    let ctx = getCurrentInstance()
    console.log(ctx, 'ctx');
    // 定义组件的状态
    const state = reactive({
      options: props.options,
      showFlag: false,       // dialog显示和隐藏
      editValue: null as undefined | null | string,
    })

    // 定义组件的方法
    const methods = {
      show: () => {
        state.showFlag = true;
      },
      hidden: () => {
        state.showFlag = false;
      }
    }

    // 定义事件的handers
    const handers = {
      onConfirm: () => {
        state.options.onConfirm(state.editValue)
        methods.hidden()
      },
      onCancel: () => {
        methods.hidden()
      }
    }
    return () => (
      // @ts-ignore
      <ElDialog
        v-model={state.showFlag}
        title={state.options.title}
      >
        {/* jsx中使用插槽方式： */}
        {{
          default: () => (
            <div>
              {state.options.editType === DialogServiceEditType.textarea ? (
                <ElInput type="textarea" {...{rows:10}} v-model={state.editValue} />
              ): (
                <ElInput type="text" v-model={state.editValue} />
              )}
            </div>
          ),
          footer: () => (
            <div>
              <ElButton {...{ onClick: handers.onConfirm } as any}>取消</ElButton>
              <ElButton {...{ onClick: handers.onCancel } as any}>确认</ElButton>
            </div>
          )
        }}
      </ElDialog>
    )
  }
})