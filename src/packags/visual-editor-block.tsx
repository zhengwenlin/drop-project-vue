import { defineComponent, PropType, computed, onMounted, ref } from "vue";
import { VisualEditorBlockData, VisualEditorConfig } from './visual-editor.utils'
export const VisualEditorBlock = defineComponent({
    name: 'visual-editor-block',
    props: {
        block: {
            type: Object as PropType<VisualEditorBlockData>,
            required: true,
        },
        config: {
            type: Object as PropType<VisualEditorConfig>,
            required: true,
        }
    },
    setup(props, ctx) {
        // 可能没有值时定义ref
        // const elm = ref(null as null | HTMLDivElement)
        // 肯定有值时定义ref
        const el = ref({} as HTMLDivElement)
        onMounted(() => {
           if(props.block.adjustPosition){
               const {offsetWidth, offsetHeight} = el.value;
               props.block.left = props.block.left - offsetWidth / 2;
               props.block.top = props.block.top - offsetHeight / 2;
               props.block.adjustPosition = false
           }
        })

        // 选中block的样式
        const bloackClasses = computed(() => [
            'visual-editor-block',
            {
                'visual-editor-block-focus': props.block.focus
            }
        ])

        const blockStyle = computed(() => ({
            top: `${props.block?.top}px`,
            left: `${props.block?.left}px`,
            zIndex: props.block.zIndex
        }))
        return () => {
            let component = props.config.componentMap[props.block.componentKey]
            let render = component.render;
            return (
                <div class={bloackClasses.value} style={blockStyle.value} ref={el}>
                    {render()}
                </div>
            )
        }
    }
})