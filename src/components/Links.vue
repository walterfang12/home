<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { config } from '../config';
</script>   

<template>
<div class="link-container">
    <a v-for="link in config.links" :key="link.name" :href="link.url" target="_blank" class="link-item card">
        <Icon v-if="link.icon" :icon="link.icon" width="36" height="36" class="link-icon"/>
        <span v-else-if="link.iconHtml" :v-html="link.iconHtml" class="link-icon"></span>
        <span class="link-name">{{ link.name }}</span>
    </a>
</div>
</template>
<style scoped>
.link-container {
    width:470px;
    display:flex;
    align-items: center;
    gap:10px;
    flex-wrap: wrap;
}
.link-item{
    text-decoration: none;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: .3s;
    flex:1;
    height: 50px;
}
.link-item:hover{
    background-color: var(--background-color-hover);
}
.link-icon{
    margin-right: 10px;
}
.link-name{
    font-size: 24px;
}
</style>
