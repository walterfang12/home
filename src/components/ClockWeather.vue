<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";
import { config } from "../config";
import { Icon } from "@iconify/vue";
import type {
  City,
  Weather,
  CityCodeRep,
  WeatherRep,
  LocationRep,
} from "../interfaces/weather";
import { Zhixiashi, Unloaded, wiMapping } from "../interfaces/weather";

const city = ref<City | Unloaded>(Unloaded.Loading);
const weatherNow = ref<Weather | Unloaded>(Unloaded.Loading);
const time = ref<string>("07:21");
const date = ref<string>("1919-08-10");
const loading = ref(false);

function updateTimeDate() {
  const now = new Date();
  time.value = now.toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  date.value = `${y}-${m}-${d}`;
}

async function refreshWeather() {
  if (loading.value) return;
  loading.value = true;

  city.value = Unloaded.Loading;
  weatherNow.value = Unloaded.Loading;

  try {
    const locationRep = await fetch("https://my.ip.cn/json/");
    if (!locationRep.ok) throw new Error("位置请求失败");
    const location: LocationRep = await locationRep.json();
    if (!location.status) throw new Error("位置数据状态错误");
    city.value = location.data;  // 先赋值城市

    const cityCodeRep = await fetch(
      `https://${config.HF_Host}/geo/v2/city/lookup/?location=${location.data.district}&adm=${location.data.city}&key=${config.HF_Key}`
    );
    if (!cityCodeRep.ok) throw new Error("城市代码请求失败");
    const cityCodeJson: CityCodeRep = await cityCodeRep.json();
    if (cityCodeJson.code !== "200") throw new Error("城市代码状态错误");
    const cityCode = cityCodeJson.location[0]?.id;
    if (!cityCode) throw new Error("未找到城市代码");

    const weatherRep = await fetch(
      `https://${config.HF_Host}/v7/weather/now?location=${cityCode}&key=${config.HF_Key}`
    );
    if (!weatherRep.ok) throw new Error("天气请求失败");
    const weather: WeatherRep = await weatherRep.json();
    if (weather.code !== "200") throw new Error("天气状态错误");

    weatherNow.value = weather.now;  // 天气赋值成功
  } catch (e) {
    // 城市已经赋值成功则不改city
    if (city.value === Unloaded.Loading) {
      city.value = Unloaded.Error;  // 只有城市都没成功时才报错
    }
    weatherNow.value = Unloaded.Error;  // 天气失败只改天气状态
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  updateTimeDate();
  const timer = setInterval(updateTimeDate, 1000);
  refreshWeather();
  onUnmounted(() => clearInterval(timer));
});
</script>

<template>
  <div class="clock-weather card">
    <div class="clock">
      <div class="time">{{ time }}</div>
      <div class="date">{{ date }}</div>
    </div>
    <div class="weather">
      <Icon
        v-if="weatherNow === Unloaded.Loading || weatherNow === Unloaded.Error"
        icon="wi:na"
        class="weather-icon"
        width="30px"
        height="30px"
      />
      <Icon
        v-else
        :icon="wiMapping[weatherNow?.icon]"
        class="weather-icon"
        width="30px"
        height="30px"
      />
      <div class="weather-text">
        <div
          v-if="city !== Unloaded.Loading && city !== Unloaded.Error"
          class="city"
        >
          <span v-if="city.country !== '中国'">{{ city.country + " " }}</span>
          <span v-if="Zhixiashi.indexOf(city.province) == -1">{{
            city.province + " "
          }}</span>
          <span>{{ city.city + " " }}</span>
          <span>{{ city.district }}</span>
        </div>
        <div v-else-if="city === Unloaded.Loading" class="city">获取中...</div>
        <div v-else class="city">获取失败</div>
        <div
          v-if="
            weatherNow !== Unloaded.Loading && weatherNow !== Unloaded.Error
          "
          class="temperature"
        >
          {{ weatherNow.text + " " + weatherNow?.temp }}°C
        </div>
        <div v-else class="temperature">--°C</div>
      </div>
      <!-- 刷新按钮 -->
      <button
        class="refresh-btn"
        @click="refreshWeather"
        :disabled="loading"
        :title="loading ? '刷新中...' : '刷新天气'"
        aria-label="刷新天气"
      >
        <Icon icon="mdi:refresh" width="20" height="20" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.refresh-btn {
  background: transparent;
  border: none;
  color: var(--font-color);
  transition: 0.3s;
  height: 24px;
  cursor: pointer;
  margin-left: 8px;
  display: flex;
  align-items: center;
  padding: 0;
}

.refresh-btn:hover:not(:disabled) {
  color: var(--font-color-hover);
  outline: none;
}

.refresh-btn:disabled {
  cursor: default;
  opacity: 0.5;
}

/* 你已有的样式保持不变 */
.clock-weather {
  height: 120px;
  width: 150px;
  display: flex;
  flex-direction: column;
  transition: 0.3s;
}

@media screen and (max-width: 500px) {
  .clock-weather {
    width: calc(100vw - 70px);
    height: 80px;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .weather {
    margin: auto;
    margin-left: 10px;
  }
  .clock {
    margin-right: 10px !important;
    transform: translateY(5px);
  }
}
@media screen and (max-width: 325px) {
  .clock-weather {
    height: 120px;
  }
  .weather {
    margin: auto !important;
  }
  .clock {
    margin: auto !important;
  }
}
.temperature {
  font-family: sans-serif;
}
.clock {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: auto;
}
.weather {
  display: flex;
  justify-content: center;
  align-items: center;
  align-items: center;
}
.time {
  font-size: 30px;
  line-height: 32px;
  font-weight: 600;
}
.weather-icon {
  margin-right: 5px;
}
</style>
