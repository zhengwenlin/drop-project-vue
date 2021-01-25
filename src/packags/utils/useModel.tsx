
import { ref, watch, defineComponent } from 'vue'
/**
 * 
 * @param getter 
 * @param emiter 
 */
export function useModel<T>(getter: () => T, emitter: (val: T) => void) {
	let state = ref(getter()) as { value: T }

	// 监听getter
	watch(getter, (val) => {
		if (state.value !== val) {
			state.value = val;
		}
	})

	return {
		get value() {
			return state.value;
		},
		set value(val: T) {
			if (val !== state.value) {
				state.value = val;
				emitter(val)
			}
		}
	}
}


export const TestUserModel = defineComponent({
	props: {
		//v-model默认传递的属性名是modelValue
		//v-model绑定的那个值
		modelValue: {
			type: String,
			requied: true,
		}
	},
	// emit
	emit: {
		// v-model使用组件内部默认抛出的事件名叫 update:modelValue
		'update:modelValue': (val?: string) => true
	},
	setup(props, ctx) {
		// 根据组件的v-model绑定的值生成一个值，修改这个值，当这个值变化是，触发事件，更新组件的属性
		const model = useModel(() => props.modelValue, (val) => {
			 ctx.emit('update:modelValue', val)
		})

		return () => (
			<div>
				自定义model：
				<input type="text" v-model={model.value} />
			</div>
		)
	}
})