import { reactive } from "vue";

interface CommandExecute {
	undo?: () => void,
	redo: () => void,
}

interface Command {
	name: string,
	keyboard?: string | string[],
	followQueue: boolean,
	execute: (...args: any[]) => CommandExecute
}

/**
 * 创建命令的方法
 */
export function useCommander() {
	let state = reactive({
		// 执行命令时保存此命令的undo和redo对象的数组
		queue: [] as CommandExecute[],
		current: -1, // 指针
		// 所有命令的map
		commands: {} as Record<string, (...args: any[]) => void>
	})
	// 注册命令的方法
	const registry = (command: Command) => {
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

	// 提供给外部使用的方法和数据
	return {
		registry,
		state
	}
}