import { Ref, unref } from "vue";
import {User} from "@/types";

const hasRole = {
    mounted: (
        el: HTMLElement,
        binding: { value: Ref<User> | User; arg: string },
        vnode: any
    ) => {
        if (unref(binding.value).roles.indexOf(binding.arg) === -1) {
            vnode.elm.parentElement.removeChild(vnode.elm);
        }
    },
};

export default {
    directives: {
        hasRole,
    },
};
