<script setup lang="ts">
import { ref } from 'vue';

const hitokoto = ref('获取一言中...');

fetch('https://v1.hitokoto.cn')
    .then(response => response.json())
    .then(data => {
        if(data.from&&data.from_who){
            hitokoto.value = `「${data.hitokoto}」\n——${data.from}《${data.from_who}》`;
        }
        else if(data.from_who){
            hitokoto.value = `「${data.hitokoto}」\n——${data.from_who}`;
        }
        else{
            hitokoto.value = `「${data.hitokoto}」\n——《${data.from}》`;
        }
    })
    .catch(() => {
        hitokoto.value = '获取一言失败';
    });

</script>
<template>
<div class="hitokoto card">
<div class="hitokoto-text">{{ hitokoto }}</div>
</div>
</template>

<style scoped>
.hitokoto{
    width: 470px;
    box-sizing: border-box;
    padding:8px 20px;
    transition: .3s;
}
@media screen and (max-width: 500px) {
    .hitokoto{
        width: calc(100vw - 40px);
    }
}
.hitokoto-text{
    text-align: center;
    line-height: 20px;
    font-size: 14px;
    white-space: pre-line;
}
</style>