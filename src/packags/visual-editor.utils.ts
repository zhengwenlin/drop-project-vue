
export interface VisualEditorBlockData {
  componentKey: string,
  top: number,
  left: number,
  adjustPosition: boolean, // 是否需要自动调整位置居中
  focus: boolean, // block选中
  zIndex: number,
  width: number,
  height: number,
  hasResize: boolean,            // 是否调整过宽高
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

export function createNewBlock({
  component,
  left,
  top,
}: {
  component: VisualEditorComponent,
  top: number,
  left: number,
}): VisualEditorBlockData {
  return {
    left,
    top,
    componentKey: component!.key,
    adjustPosition: true, // 第一次拖过去是需要调整位置的
    focus: true,
    zIndex: 0,
    width: 0,
    height: 0,
    hasResize: false,
  }
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


/**
 * 辅助线的类型
 */
export interface VisualEditorMarkLines {
  x: { left: number, showLeft: number }[],
  y: { top: number, showTop: number }[]
}

