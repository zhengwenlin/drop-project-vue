import {defineComponent, PropType, computed, onMounted, ref, Slot} from 'vue';
import {VisualEditorBlockData, VisualEditorConfig} from '../packags/visual-editor.utils';
import {BlockResize} from "./components/block-resizer/block-resize";

export const VisualEditorBlock = defineComponent({
    props: {
        block: {type: Object as PropType<VisualEditorBlockData>, required: true},
        config: {type: Object as PropType<VisualEditorConfig>, required: true},
        formData: {type: Object as PropType<Record<string, any>>, required: true},
        slots: {type: Object as PropType<Record<string, Slot | undefined>>, required: true},
        customProps: {type: Object as PropType<Record<string, any>>},
    },
    setup(props) {

        const el = ref({} as HTMLDivElement)

        const classes = computed(() => [
            'visual-editor-block',
            {
                'visual-editor-block-focus': props.block.focus,
            }
        ])

        const styles = computed(() => ({
            top: `${props.block.top}px`,
            left: `${props.block.left}px`,
            zIndex: props.block.zIndex,
        }))

        onMounted(() => {
            /*添加组件的时候，自动调整位置上下左右居中*/
            const block = props.block
            if (block.adjustPosition === true) {
                const {offsetWidth, offsetHeight} = el.value
                block.left = block.left - offsetWidth / 2
                block.top = block.top - offsetHeight / 2
                block.height = offsetHeight
                block.width = offsetWidth
                block.adjustPosition = false
            }
        })

        return () => {

            const component = props.config.componentMap[props.block.componentKey]
            const formData = props.formData as Record<string, any>
            let render: any;
            if (!!props.block.slotName && !!props.slots[props.block.slotName]) {
                render = props.slots[props.block.slotName]!()
            } else {
                render = component.render({
                    size: props.block.hasResize ? {
                        width: props.block.width,
                        height: props.block.height,
                    } : {},
                    props: props.block.props || {},
                    model: Object.keys(component.model || {}).reduce((prev, propName) => {
                        const modelName = !props.block.model ? null : props.block.model[propName]
                        prev[propName] = {
                            [propName === 'default' ? 'modelValue' : propName]: !!modelName ? formData[modelName] : null,
                            /*@ts-ignore*/
                            [propName === 'default' ? 'onUpdate:modelValue' : 'onChange']: (val: any) => !!modelName && (formData[modelName] = val)
                        }
                        return prev
                    }, {} as Record<string, any>),
                    custom: (!props.block.slotName || !props.customProps) ? {} : (props.customProps[props.block.slotName] || {})
                })
            }

            const {width, height} = component.resize || {}

            return (
                <div class={classes.value} style={styles.value} ref={el}>
                    {render}
                    {!!props.block.focus && (!!width || !!height) &&
                    <BlockResize block={props.block} component={component}/>}
                </div>
            )
        }
    },
})