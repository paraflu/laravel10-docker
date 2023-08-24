<script lang="ts" setup>
import { useCurrencyInput } from "vue-currency-input";
import { onMounted, watch } from "vue";

const props = defineProps<{ context: { options?: any, _value: any, node: any, disabled?: boolean } }>();

const { inputRef, numberValue, setValue } = useCurrencyInput(props.context.options ?? {
  currency: 'EUR',
  locale: 'it',
  precision: 2
}, false);

watch(numberValue, (value) => props.context.node.input(value));

const selectAll = e => e.target.select();

const initFormat = v => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v)
onMounted(() => {
  inputRef.value.value = initFormat(props.context._value ?? 0);
});
</script>

<template>
  <input ref="inputRef" class="form-control" type="text" @focus="selectAll" :disabled="context.disabled" />
  <input type="hidden" v-model="context._value" :name="context.node.name">
</template>
