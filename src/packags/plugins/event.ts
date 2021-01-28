
export type SympolListener = () => void;
/**
 * 实现了一个简单的发布订阅的events
 */
export function createEvent() {
    let listenerList: SympolListener[] = []
    return {
        on: (cb: SympolListener) => {
            listenerList.push(cb)

        },
        off: (cb: SympolListener) => {
            let index = listenerList.findIndex(item => item === cb)
            if (index > -1) listenerList.splice(index, 1)
        },
        emit: () => {
            listenerList.forEach(listener => listener())
        }
    }
}