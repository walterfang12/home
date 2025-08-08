<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { config } from "../config";
</script>

<template>
  <div class="card personal">
    <div class="personal-front">
      <img class="avatar" :src="config.avatar" alt="Avatar" />
      <span class="author">{{ config.author }}</span>
      <span class="description">{{ config.description }}</span>
    </div>
    <div class="personal-back">
      <span class="back-description">{{ config.backDescription }}</span>
      <div class="socials">
        <a
          class="social-link"
          v-for="social in config.socials"
          :key="social.name"
          :href="social.url"
          :title="social.name"
          target="_blank"
        >
          <Icon
            class="icon-iconify"
            v-if="social.icon"
            :icon="social.icon"
            width="24"
            height="24"
          />
          <span
            class="icon-html"
            v-else-if="social.iconHtml"
            v-html="social.iconHtml"
          ></span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.personal {
  width: 250px;
  height: 120px;
  transition: 1s transform, 0.3s color, 0.3s background-color;
  transform-style: preserve-3d;
  position: relative;
}

@media screen and (max-width: 500px) {
  .personal {
    width: calc(100vw - 70px);
    height: 100px;
  }
}
@media screen and (max-width: 312px) {
  .personal {
    height: 150px;
  }
  .avatar {
    margin-right: 0!important;
  }
}
@media screen and (max-width: 250px) {
  .author{
    font-size:24px!important;
    width: 100%;
    text-align: center;
  }
}
.personal:hover {
  transform: rotateY(180deg);
}
.personal-front,
.personal-back {
  display: flex;
  flex-wrap: wrap;
  backface-visibility: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 15px;
  box-sizing: border-box;
  left: 0;
  top: 0;
  align-items: center;
  justify-content: center;
}
.personal-back {
  transform: rotateY(180deg);
}
.author {
  font-size: 40px;
  font-weight: 600;
  line-height: 40px;
}
.description {
  line-height: 18px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 16px;
  border: 2px solid #fffa;
  transition: 0.3s;
}
.back-description {
  margin: auto;
  width: 100%;
  text-align: center;
}
.socials {
  margin: auto;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.social-link {
  color: var(--font-color);
  fill: var(--font-color);
  text-decoration: none;
  width: 24px;
  height: 24px;
  transition: 0.3s;
}
.social-link:hover {
  color: var(--font-color-hover);
  fill: var(--font-color-hover);
}
</style>
