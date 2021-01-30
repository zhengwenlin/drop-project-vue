import { createApp, defineComponent, getCurrentInstance, PropType, reactive } from "vue";

enum MessageType {
    primary = 'primary',
    success = 'success',
    info = 'info',
    warn = 'warn',
    error = 'error'
}

const keyGenerate = (() => {
    let count = 0;
    return () => `auto_key_${count}`
})();


const MessageComponet = defineComponent({
    props: {
        message: {
            type: String as PropType<string>,
            required: true,
        },
        messageType: {
            type: String as PropType<MessageType>,
            default: MessageType.primary
        }
    },

    setup(props) {
        let ctx = getCurrentInstance()
        const state = reactive({
            message: props.message,
            messageType: props.messageType,
            key: keyGenerate()
        })

        const methods = {
            service: (message: string, messageType: MessageType) => {
                state.message = message;
                state.messageType = messageType
                state.key = keyGenerate()
            },
            getColorTheme: (type: MessageType) => {
                let map = {
                    [MessageType.primary]: '#409EFF',
                    [MessageType.success]: '#67C23A',
                    [MessageType.warn]: '#E6A23C',
                    [MessageType.error]: '#F56C6C',
                    [MessageType.info]: '#909399',
                }
                return map[type]
            }
        }

        const messageStyle = {
            height: '25px',
            width: '250px',
            backgroundColor: torgb(methods.getColorTheme(state.messageType), 0.3),
            // backgroundColor: methods.getColorTheme(state.messageType),
            padding: '6px 10px',
            color: methods.getColorTheme(state.messageType),
            fontSize: '13px',
            position: 'absolute',
            left: (document.body.offsetWidth / 2 - 125) + 'px',
            top: '10px',
            zIndex: 999,
            borderRadius: '4px',
            lineHeight: '25px'
        }
        // 将方法挂载到实例上
        Object.assign(ctx!.proxy, methods)
        return () => (
            <div style={messageStyle as any} key={state.key}>
                {state.message}
            </div>
        )
    }
})


const messageService = (message: string, messageType: MessageType) => {
    let ins: any;
    if (!ins) {
        let el = document.createElement('div');
        document.body.appendChild(el)

        let app = createApp(MessageComponet, { message, messageType })
        ins = app.mount(el)

        setTimeout(() => {
            app.unmount(el)
        }, 2000)
    }
    ins.service(message, messageType)
}


export const $$$message = Object.assign(messageService, {
    [MessageType.primary]: (message: string) => {
        messageService(message, MessageType.primary)
    },
    [MessageType.success]: (message: string) => {
        messageService(message, MessageType.success)
    },
    [MessageType.warn]: (message: string) => {
        messageService(message, MessageType.warn)
    },
    [MessageType.error]: (message: string) => {
        messageService(message, MessageType.error)
    },
    [MessageType.info]: (message: string) => {
        messageService(message, MessageType.info)
    }
})


function torgb(a:any, opcity:number) {
    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    var sColor = a.toLowerCase();
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return `rgba(${sColorChange.join(",")},  ${opcity})`
    } else {
        return sColor;
    }
}