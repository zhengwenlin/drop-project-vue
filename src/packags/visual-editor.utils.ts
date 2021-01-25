
export interface VisualEditorBlockData {
  top: number,
  left: number
}

export interface VisualEditorModelValue {
  container: {
    width: number,
    height: number
  },
  blocks: VisualEditorBlockData[]
}


// 分为预览和渲染两个部分的组件，返回类型是JSX.element
export interface VisualEditorComponent {
  key: string,
  label: string,
  preview: () => JSX.Element,
  render: () => JSX.Element
}

/**
 * 定义config的类型，这个类型包括左侧菜单的数据，以及用户自己注册组件的方法等
 */
export function createVisualEditorConfig() {
  // 放组件的数据
  const componentList: VisualEditorComponent[] = []
  // 组件名称的映射表
  const componentMap: Record<string, VisualEditorComponent> = {}
  return {
    componentList,
    componentMap,
    // 提供注册的方法
    registry: (key: string, component: Omit<VisualEditorComponent, 'key'>) => {
      let com = { ...component, key }
      componentList.push(com)
      componentMap[key] = com;
    }
  }
}

export type VisualEditorConfig = ReturnType<typeof createVisualEditorConfig>


// let config = createVisualEditorConfig()
// config.registry('input', {
//     label: 'BUTTON',
//     preview: () => '按钮',
//     render: () => '渲染按钮'
// })


