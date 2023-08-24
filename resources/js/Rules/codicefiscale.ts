import {FormKitNode} from "@formkit/core";
import {FormKitValidationRule} from "@formkit/validation";
import {Validator} from "@marketto/codice-fiscale-utils";

const codiceFiscale: FormKitValidationRule = function (node: FormKitNode) {
    if (typeof node.value !== "string") {
        return false;
    }
    const cf = node.value as string;
    return Validator.codiceFiscale(cf).valid;
};

export default codiceFiscale;
