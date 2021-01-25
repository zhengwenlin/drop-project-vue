import {createVisualEditorConfig, VisualEditorConfig} from './packags/visual-editor.utils';
import {ElButton, ElInput} from 'element-plus'
export const visualConfig: VisualEditorConfig = createVisualEditorConfig()

visualConfig.registry('text', {
  preview: () => '预览文本',
  render: () => '渲染文本',
  label: '文本',
})

visualConfig.registry('button', {
  preview: () => (<ElButton>按钮</ElButton>),
  render: () => (<ElButton>渲染按钮</ElButton>),
  label: '按钮',
})


visualConfig.registry('input', {
  preview: () => (<ElInput />),
  render: () => (<ElInput />),
  label: '输入框',
})