<script setup lang="ts">

</script>

<template>
  <div class="container mt-5">
    <div class="card">
      {{1+1}}
      <div class="card-body">
        <p class="text-success">{{ $t('messages.welcome') }}</p>
        <a href="/horizon" target="_blank">{{ $t('messages.horizon_link') }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
