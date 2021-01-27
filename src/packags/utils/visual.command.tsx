import { useCommander } from "../plugins/command.plugin"
import { VisualEditorBlockData, VisualEditorModelValue } from "../visual-editor.utils";
import deepcopy from 'deepcopy'

export const useVisualCommander = ({
    focusData,  // 选中和没有选中的数据
    dataModel,  // 所有的数据  blcoks container
    updateBlocks, //更新blocks的方法
}: {
    focusData: { value: { focus: VisualEditorBlockData[], unFocus: VisualEditorBlockData[] } },
    dataModel: { value: VisualEditorModelValue },
    updateBlocks: (blocks?: VisualEditorBlockData[]) => void
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

    // 向外部导出的方法
    return {
        undo: () => commander.state.commands.undo(),
        redo: () => commander.state.commands.redo(),
        delete: () => commander.state.commands.delete()
    }
}