import {generateClasses} from "@formkit/themes";
import {createInput, defaultConfig} from "@formkit/vue";
import {it} from "@formkit/i18n";
import CurrencyInput from "@/Components/CurrencyInput.vue";

import codiceFiscale from "@/Rules/codicefiscale";

const config = defaultConfig({
    locales: {it},
    locale: "it",
    rules: {codiceFiscale},
    config: {
        // https://dev.to/morgenstern2573/how-to-integrate-formkit-and-bootstrap-2571
        classes: generateClasses({
            global: {
                // classes
                outer: "$reset mb-3",
                input: "form-control",
                label: "form-label",
                help: "form-text",
                messages: "list-none",
                message: "text-danger",
                placeholder: "text-muted",
            },
            checkbox: {
                outer: "form-check",
                input: "$reset form-check-input",
                label: "form-check-label",
            },
            range: {
                input: "$reset form-range",
            },
            file: {
                outer: "$reset",
                fileItem: "list-group-item",
                fileList: "list-group my-1",
                fileRemove: "btn btn-danger",
                fileName: "",
            },
            submit: {
                outer: "$reset",
                input: "$reset btn btn-primary",
            },
        }),
    },
    inputs: {
        currency: createInput(CurrencyInput, {props: ["options"]}),
        //     userSelect: createInput(UserSelect, {
        //         props: ["studioId", "placeholder"],
        //     }),
        //     studioSelect: createInput(StudiSelect, { props: ["placeholder"] }),
        //     roleSelect: createInput(RoleSelect, {
        //         props: ["placeholder", "maxRole"],
        //     }),
        //     editor: createInput(Editor, {
        //         props: ["placeholder"],
        //     }),
    },
});

export default config;
