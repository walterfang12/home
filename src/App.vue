<script setup lang="ts">
import { config } from './config.ts';
import PersonalCard from './components/PersonalCard.vue';
import Background from './components/Background.vue';
import ThemeSwitcher from './components/ThemeSwitcher.vue';
import ClockWeather from './components/ClockWeather.vue';
import Hitokoto from './components/Hitokoto.vue';
import Links from './components/Links.vue';
</script>

<template>
    <title>
        {{ config.title }}
    </title>
    <Background /> 
    <ThemeSwitcher />
    <div class="cards-container">
        <PersonalCard />
        <ClockWeather />
        <Links/>
        <Hitokoto/>
    </div>
</template>

<style scoped>
.cards-container {
    display: flex;
    margin:auto;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
}
</style>