<script setup lang="ts">
// const props = defineProps<{ context: { options?: any, _value: any, node: any, disabled?: boolean } }>();
import {ref} from "vue";
import route from "ziggy-js";
import {debounce} from "@/Helpers/debounce";
//
// const service = new ApiService();
//
// const search = async (q: string): Promise<Customer[]> => {
//   loading.value = true;
//   try {
//     const { result, success, query } = await service.queryCustomer(q);
//     return result;
//   } catch (err) {
//     console.error(err);
//   } finally {
//     loading.value = false;
//   }
//   return [];
// }
//
const value = ref<string>('');
// const res = ref<Pick<Customer, 'id' | 'ragsoc'>[] | null>(null);
const res = ref<Array<any> | null>(null);
const focused = ref<boolean>(true);
const loading = ref<boolean>(false);
//

const onKeydown = debounce(async (e: KeyboardEvent) => {
  res.value = [];
  // res.value = await search(value.value);
}, 400);

const onFocus = () => {
  focused.value = true;
}

const onBlur = () => {
  focused.value = false;
}
</script>

<template>
  <div class="main_container">
    <div class="d-flex align-items-center position-relative">
      <input :type="loading ? 'text' : 'search'" @keydown="onKeydown" @focus="onFocus" @blur="onBlur" v-model="value"
             class="form-control" :placeholder="$t('Ricerca iscritto')">
      <div class="position-absolute spinner">
        <i class="fas fa-spin fa-spinner" v-if="loading"></i>
      </div>
    </div>
    <transition>
      <div v-if="res && focused && !loading" class="results">
        <div v-if="res.length">
          trovato
<!--          <a :href="route('customer.detail', { customer: c.id })"-->
<!--             class="item align-items-center text-decoration-none text-dark" role="button" v-for="c in res"-->
<!--             :key="c.id">-->
<!--            <div class="flex-grow-1 text-truncate" :title="c.ragsoc">{{ c.ragsoc }}</div>-->
<!--            <a :href="route('customer.detail', { customer: c.id })"-->
<!--               class="ms-1 btn btn-sm btn-outline-secondary" :title="$t('Anagrafica')">-->
<!--              <i class="fa-solid fa-user"></i>-->
<!--            </a>-->
<!--          </a>-->
        </div>
        <a role="button" v-else class="px-2 d-flex text-decoration-none align-items-center text-dark text-muted"
           :href="route('customer.create')">
          <div class="flex-grow-1 text-truncate">{{ $t('Nessun risultato') }}</div>
          <a :href="route('customer.create')" class="ms-1 btn btn-sm btn-outline-secondary"
             :title="$t('Inserisci nuova anagrafica')">
            <i class="fa-solid fa-file"></i>
          </a>
        </a>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
@import "bootstrap";

.main_container {
  position: relative;
  width: 20rem;
}

.spinner {
  right: 0.8rem;
}

.results {
  z-index: 1000;
  @extend .py-2, .bg-light, .w-100, .mt-2, .border, .rounded-bottom;
  position: absolute;
  max-height: 20rem;
  overflow-y: auto;

  /* we will explain what these classes do next! */
  &.v-enter-active,
  &.v-leave-active {
    transition: opacity 0.5s ease;
  }

  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
  }

  .item {
    @extend .mx-2, .p-2, .mt-1;
    display: flex;

    &:hover {
      background-color: lighten($primary, 30%);
    }
  }
}
</style>
