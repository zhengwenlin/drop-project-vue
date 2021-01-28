import { useCommander } from "../plugins/command.plugin"
import { VisualEditorBlockData, VisualEditorModelValue } from "../visual-editor.utils";
import deepcopy from 'deepcopy'

export const useVisualCommander = ({
    focusData,  // 选中和没有选中的数据
    dataModel,  // 所有的数据  blcoks container
    updateBlocks, //更新blocks的方法
    dragstart,
    dragend
}: {
    focusData: { value: { focus: VisualEditorBlockData[], unFocus: VisualEditorBlockData[] } },
    dataModel: { value: VisualEditorModelValue },
    updateBlocks: (blocks?: VisualEditorBlockData[]) => void,
    dragstart: { on: (cb: () => void) => void, off: (cb: () => void) => void },
    dragend: { on: (cb: () => void) => void, off: (cb: () => void) => void },
}) => {
    let commander = useCommander();


    commander.registry({
        name: 'delete',
        keyboard: [
            'delete',
            'backspace'
        ],
        followQueue: true,
        execute: () => {
            console.log('删除命令执行了');
            // 删除的逻辑，页面选中的元素，点击删除，将元素删除掉
            // 怎么做：知道哪些元素被选中了，删除的时候，将这些元素移除掉
            // 撤销和重做的逻辑？
            // 
            let data = {
                // 上一次的数据
                before: dataModel.value.blocks,
                // 删除选中的元素，剩下的就是未选中的。
                // 所谓的删除就是渲染哪些没有被选中的元素
                after: focusData.value.unFocus,
            }
            return {
                redo: () => {
                    updateBlocks(deepcopy(data.after))
                },
                undo: () => {
                    updateBlocks(deepcopy(data.before))
                },

            }
        }
    });


    // 我们希望  1. 从菜单拖拽到画布的时候，也能有命令队列，可以撤销和重做
    //          2. 画布中拖拽block的位置，也能有撤销和重做
    // 因此，需要封装一个drag的命令，用于此功能
    // 那么，怎么监控拖拽事件呢?从菜单到画布用的是drag事件，画布拖拽用的是mouse事件
    // 而且事件是异步的，想让异步触发的时候通知我们，就需要使用发布订阅模式

    // 这里需要订阅dragstart和dragend事件的触发
    commander.registry({
        name: 'drag',
        followQueue: true,
        init() {
            // 主要就是记录开始和结束时的数据，before和after
            this.data = {
                before: null as null | VisualEditorBlockData[],
            }
            // handlers 对象
            const handler = {
                dragstart: () => {
                    // 记录拖拽前的数据
                    this.data.before = deepcopy(dataModel.value.blocks)
                },
                // 拖拽结束时触发该方法
                // 拖拽结束后，要执行拖拽命令，将命令加入到命令队列中去，方便撤销和重做
                dragend: () => {
                    commander.state.commands.drag()
                }
            }
            // 监听拖拽开始事件
            dragstart.on(handler.dragstart)
            // 监听拖拽结束事件
            dragend.on(handler.dragend)

            return () => {
                dragstart.off(handler.dragstart)
                dragend.off(handler.dragend)
            }
        },
        execute() {
            // 执行拖拽命令逻辑
            let before = deepcopy(this.data.before)
            let after = deepcopy(dataModel.value.blocks)
            return {
                redo: () => {
                    updateBlocks(deepcopy(after))
                },
                undo: () => {
                    //撤销就是渲染上一次的数据
                    updateBlocks(deepcopy(before))
                }
            }
        }
    })

    // 清空命令
    commander.registry({
        name: 'clear',
        followQueue: true,
        execute: () => {
            let data = {
                before: [] as VisualEditorBlockData[],
                after: [] as VisualEditorBlockData[]
            }
            data.before = deepcopy(dataModel.value.blocks)
            return {
                undo: () => {
                    updateBlocks(deepcopy(data.before))
                },
                redo: () => {
                    updateBlocks(deepcopy([]))
                }
            }
        }
    })

    // 1.初始化事件 2.调用每个command中的init方法，订阅事件
    commander.init()
    // 向外部导出的方法
    return {
        undo: () => commander.state.commands.undo(),
        redo: () => commander.state.commands.redo(),
        delete: () => commander.state.commands.delete(),
        clear: () => commander.state.commands.clear()
    }
}