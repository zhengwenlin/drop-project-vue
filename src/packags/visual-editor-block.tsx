import { defineComponent, PropType, computed } from "vue";
import {VisualEditorBlockData} from './visual-editor.utils'
export const VisualEditorBlock = defineComponent({
    name: 'visual-editor-block',
    props: {
        block: {
            type: Object as PropType<VisualEditorBlockData>
        }
    },
    setup(props, ctx){
       const blockStyle = computed(() => ({
           top: `${props.block?.top}px`,
           left: `${props.block?.left}px`
       }))
       return () => (
           <div class="visual-editor-block-item" style={blockStyle.value}>
               这是一条block
           </div>
       )
    }
})