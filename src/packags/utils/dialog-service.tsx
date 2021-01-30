

/**
 * 怎么写一个组件服务？
 * 就是动态挂载一个组件
 * 1. 有一个组件
 * 2. 调用函数的方式东塔挂载
 */

import { createApp, defineComponent, getCurrentInstance, PropType, reactive } from "vue";
import { ElButton, ElInput, ElDialog } from 'element-plus'
import { defer } from "./defer";
enum DialogServiceEditType {
  textarea = 'textarea',
  input = 'input'
}
/**组件的接口规范 */
interface DialogServiceOption {
  title?: string,
  editType: DialogServiceEditType,
  onConfirm: (val?: null | string) => void,
  editReadonly?: boolean,
  editValue?: null | string,
}

// key自增
const keyGenerate = (() => {
  let count: number = 0;
  return () => `auto_key_${count++}`
})();


const ServiceComponet = defineComponent({
  props: {
    options: {
      type: Object as PropType<DialogServiceOption>,
      required: true,
    }
  },
  setup(props) {

    let ctx = getCurrentInstance()

    const state = reactive({
      showFlag: false,
      option: props.options,
      editValue: null as null | undefined | string,
      key: keyGenerate()
    })

    const methods = {
      //service方法是在该组件挂载完成后调用的，会更新数据，并且让弹出框显示
      service: (option: DialogServiceOption) => {
        // 修改了选项的数据和绑定的数据
        state.option = option;
        state.editValue = option.editValue;
        state.key = keyGenerate()
        methods.show()
      },
      hide: () => {
        state.showFlag = false;
      },
      show: () => {
        state.showFlag = true;
      }
    }

    const handers = {
      onSubmmit: () => {
        // onConfirm就是resolve方法 redolve(value)
        state.option.onConfirm(state.editValue)
        methods.hide()
      },
      onCancel: () => {
        methods.hide()
      }
    }
    // 将所有的methods方法都合并到组件实例的代理对象上
    Object.assign(ctx!.proxy, methods)

    return () => (
      // @ts-ignore
      <ElDialog v-model={state.showFlag} key={state.key}>
        {/* 使用插槽的方式定义内容 */}
        {{
          default: () => (
            <div>
              {state.option.editType === DialogServiceEditType.textarea ? (
                <ElInput type="textarea" {...{ rows: 10 }} v-model={state.editValue} />
              ) : (
                  <ElInput v-model={state.editValue} />
                )}
            </div>
          ),
          footer: () => (
            <div>
              <ElButton {...{ onClick: handers.onCancel } as any}>取消</ElButton>
              <ElButton {...{ onClick: handers.onSubmmit } as any} type="primary">确定</ElButton>
            </div>
          )
        }}
      </ElDialog>
    )
  }
})

/**
 * 弹出框服务
 */
const DialogService = (() => {
  let ins: any;

  return (option: DialogServiceOption) => {
    //动态挂载并创建实例
    if (!ins) {
      let el = document.createElement('div');
      document.body.appendChild(el);
      let app = createApp(ServiceComponet, { option })
      ins = app.mount(el)
    }
    //调用实例的service方法
    ins.service(option)
  }
})();


export const $$dialog = Object.assign(DialogService, {
  input: (initValue?: string, title?: string, option?: Omit<DialogServiceOption, 'editType' | 'onConfirm'>) => {
    const dfd = defer<string | null | undefined>();
    const opt: DialogServiceOption = {
      ...option,
      editType: DialogServiceEditType.input,
      title,
      editValue: initValue,
      onConfirm: dfd.resolve
    }
    DialogService(opt)
    return dfd.promise;
  },
  textarea: (initValue?: string, title?: string, option?: Omit<DialogServiceOption, 'editType' | 'onConfirm'>) => {
    const dfd = defer<string | null | undefined>();
    const opt: DialogServiceOption = {
      ...option,
      editType: DialogServiceEditType.textarea,
      title,
      editValue: initValue,
      onConfirm: dfd.resolve
    }
    DialogService(opt)
    return dfd.promise;
  }
})
