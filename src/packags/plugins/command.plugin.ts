import { onUnmounted, reactive } from "vue";
import { KeyboardCode } from "./keyboard-code";

interface CommandExecute {
	undo?: () => void,
	redo: () => void,
}

interface Command {
	name: string,
	keyboard?: string | string[],
	followQueue: boolean,
	init?: () => ((() => void) | undefined),
	execute: (...args: any[]) => CommandExecute,
	data?: any
}

/**
 * 创建命令的方法
 */
export function useCommander() {
	let state = reactive({
		// 执行命令时保存此命令的undo和redo对象的数组
		queue: [] as CommandExecute[],
		commandArray: [] as Command[],   // 存放command的数组init方法中会用到
		current: -1, // 指针
		// 所有命令的map
		commands: {} as Record<string, (...args: any[]) => void>,
		destoryList: [] as ((() => void) | undefined)[] // 用于存放当组件销毁时，需要销毁的函数
	})
	// 注册命令的方法
	const registry = (command: Command) => {
		// 将command存放到这个数组中
		state.commandArray.push(command)
		// 调用此方法，给commands中添加了一条命令，命令是一个函数，
		// 该函数执行的时候，会执行execute方法，返回undo，redo两个方法
		// 该函数调用registry时是不会执行的，是在调用命令时执行的
		state.commands[command.name] = (...args: any[]) => {
			// 调用execute就会执行命令的逻辑
			let { undo, redo } = command.execute(...args)
			// 先执行命令的逻辑
			!!redo && redo()

			if (command.followQueue) {
				// 调用一次命令就会将这个命令的execute的返回值undo和redo保存到queue中
				state.queue.push({ undo, redo })
				state.current += 1; // 调用一次命令就加1
			}
		}
	}

	// 监听键盘事件，实现快捷键功能
	// 添加事件 移除事件是一对，都要做
	const keyboardEvent = (() => {
		// 处理函数
		const keydown = (e: KeyboardEvent) => {
			/**
			 * e的主要的属性：
			 * 1. e.code 当前按下的键
			 * 2. e.shiftKey 布尔类型，当前是否按下了shift键
			 * 3. e.keyCode 当前键对应的数字标识
			 * 
			 * document.activeElement 当前获得焦点的元素
			 *  - 比如全选的时候，shift + a，如果是在body上，才处理
			 *  - 如果是在其他元素，比如input，不应该全选，合理的是选中input中的内容
			 */
			// 
			// 只处理body获取焦点的情况
			if (document.activeElement !== document.body) {
				return;
			}

			let { keyCode, ctrlKey, metaKey, shiftKey, altKey, code } = e;

			let keyString: string[] = [];
			// 常用的快捷键 shift ctrl alt + 其他键
			if (ctrlKey || metaKey) keyString.push('ctrl');
			if (shiftKey) keyString.push('shift');
			if (altKey) keyString.push('alt')
			keyString.push(KeyboardCode[keyCode])

			const keyNames: string = keyString.join('+');

			// 获取到了命令的字符串
			state.commandArray.forEach(command => {
				if (!command.keyboard) return;

				const keys = Array.isArray(command.keyboard) ? command.keyboard : [command.keyboard];

				if (keys.indexOf(keyNames) > -1) {
					state.commands[command.name]()
					e.preventDefault()
					e.stopPropagation()
				}
			})

		}
		const init = () => {
			// 监听键盘按下的事件
			window.addEventListener('keydown', keydown)
			// 返回注销事件的函数
			return () => {
				window.removeEventListener('keydown', keydown)
			}
		}
		return init;
	})();

	/**
	 * init方法，负责调用useCommander方法时，初始化键盘监听事件，调用命令的初始化逻辑
	 */
	const init = () => {
		// 监听事件，并将销毁函数保存到数组
		state.destoryList.push(keyboardEvent())
		// 将销毁的函数都放到数组中
		state.commandArray.forEach(command => {
			// command.init调用了订阅的方法
			!!command.init && state.destoryList.push(command.init())
		})
	}


	// 调用useCommander方法的时候，内部默认注册的命令

	// 1. 撤回命令
	// 执行了命令A，将A的undo，redo放入了queue，然后执行了撤销命令
	// 应该怎么做？
	// 应该执行A命令的undo方法即可
	registry({
		name: 'undo',
		keyboard: 'ctrl+z',
		followQueue: false, // 不添加到queue中
		execute: () => {
			// 执行命令时做的事情
			return {
				// 重新做一遍事情
				redo: () => {
					// 应该做什么？
					let { current } = state;
					// 如果执行撤销命令，但是之前没有执行任何命令，就什么也不做，
					// 不产生任何效果
					if (current === -1) return;

					let { undo } = state.queue[current]
					// 如果undo有值，就执行undo方法
					!!undo && undo()

					// 修改当前的指针，指针向前移动
					state.current -= 1;
				}
			}
		}
	})

	// 2. 重做方法
	// 执行了A命令，执行了撤销，再执行重做命令
	// 应该执行queue队列中的当前指针的redo方法
	registry({
		name: 'redo',
		keyboard: [
			'ctrl+y',
			'ctrl+shift+z'
		],
		followQueue: false,
		execute: () => {
			return {
				redo: () => {
					let { current } = state;
					// 先看看后边一项有值没有
					let queueItem = state.queue[current + 1]
					if (!!queueItem) {
						let { redo } = queueItem;
						!!redo && redo()
						// 指针向后移动
						state.current++;
					}
				},
			}
		}
	})


	// 注销函数事件
	onUnmounted(() => {
		state.destoryList.forEach(fn => !!fn && fn())
	})

	// 提供给外部使用的方法和数据
	return {
		init,
		registry,
		state
	}
}
