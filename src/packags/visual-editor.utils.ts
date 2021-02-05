import {VisualEditorProps} from "../packags/visual-editor.props";
import {inject, provide} from "vue";
export interface VisualEditorBlockData {
    componentKey: string,                           
    top: number,                                    
    left: number,                                   
    adjustPosition: boolean,                        
    focus: boolean,                                 
    zIndex: number,                                
    width: number,                                  
    height: number,                                 
    hasResize: boolean,                             
    props: Record<string, any>,                   
    model: Record<string, string>,                  
    slotName?: string,                              
}

export interface VisualEditorModelValue {
    container: {
        width: number,
        height: number,
    },
    blocks?: VisualEditorBlockData[],
}

export interface VisualEditorComponent {
    key: string,
    label: string,
    preview: () => JSX.Element,
    render: (data: {
        props: any,
        model: any,
        size: { width?: number, height?: number },
        custom: Record<string, any>,
    }) => JSX.Element,
    props?: Record<string, VisualEditorProps>,
    model?: Record<string, string>,
    resize?: { width?: boolean, height?: boolean },
}

export interface VisualEditorMarkLines {
    x: { left: number, showLeft: number }[],
    y: { top: number, showTop: number }[]
}

export function createNewBlock(
    {
        component,
        left,
        top,
    }: {
        component: VisualEditorComponent,
        top: number,
        left: number,
    }): VisualEditorBlockData {
    return {
        top,
        left,
        componentKey: component!.key,
        adjustPosition: true,
        focus: false,
        zIndex: 0,
        width: 0,
        height: 0,
        hasResize: false,
        props: {},
        model: {},
    }
}

export interface VisualDragEvent {
    dragstart: {
        on: (cb: () => void) => void,
        off: (cb: () => void) => void,
        emit: () => void,
    },
    dragend: {
        on: (cb: () => void) => void,
        off: (cb: () => void) => void,
        emit: () => void,
    },
}

export const VisualDragProvider = (() => {
    const VISUAL_DRAG_PROVIDER = '@@VISUAL_DRAG_PROVIDER'
    return {
        provide: (data: VisualDragEvent) => {
            provide(VISUAL_DRAG_PROVIDER, data)
        },
        inject: () => {
            return inject(VISUAL_DRAG_PROVIDER) as VisualDragEvent
        },
    }
})();

export function createVisualEditorConfig() {
    const componentList: VisualEditorComponent[] = []
    const componentMap: Record<string, VisualEditorComponent> = {}
    return {
        componentList,
        componentMap,
        registry: <_,
            Props extends Record<string, VisualEditorProps> = {},
            Model extends Record<string, string> = {},
            >(key: string, component: {
            label: string,
            preview: () => JSX.Element,
            render: (data: {
                props: { [k in keyof Props]: any },
                model: Partial<{ [k in keyof Model]: any }>,
                size: { width?: number, height?: number },
                custom: Record<string, any>,
            }) => JSX.Element,
            props?: Props,
            model?: Model,
            resize?: { width?: boolean, height?: boolean },
        }) => {
            let comp = {...component, key}
            componentList.push(comp)
            componentMap[key] = comp
        }
    }
}

export type VisualEditorConfig = ReturnType<typeof createVisualEditorConfig>