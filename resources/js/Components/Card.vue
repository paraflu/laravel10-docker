<template>
  <div class="mx-4">
    <div class="max-w-7xl mx-auto">
      <section class="m-4 p-4 bg-white dark:bg-gray-800 shadow sm:rounded-lg text-gray-900 dark:text-gray-100">
        <div>
          <slot />
        </div>
        <div class="flex justify-end">
          <slot name="footer"></slot>
        </div>
      </section>
    </div>
  </div>

</template>

<script>
export default {
  name: "Card"
};
</script>

<style scoped>
section {
  display: grid;
  min-height: 30em;
  grid-template-rows: auto min-content;
}
</style>
