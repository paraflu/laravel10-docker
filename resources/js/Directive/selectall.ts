import { VNode } from "vue";

const selectAll = {
    mounted(el: HTMLInputElement, binding: any, vnode: VNode) {
        console.log(vnode);
        el.querySelector("input")?.addEventListener(
            "focus",
            (ev: FocusEvent) => {
                (ev.target as HTMLInputElement)?.select();
            }
        );
    },
};

export default selectAll;
