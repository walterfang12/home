<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
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
const hover = ref(false);

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
  const w = now.toLocaleDateString("zh-CN", { weekday: "short" });
  date.value = `${y}-${m}-${d} ${w}`;
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
    city.value = location.data; // 先赋值城市
    let cityCodeRep: Response;
    if (location.data.district) {
      cityCodeRep = await fetch(
        `https://${config.HF_Host}/geo/v2/city/lookup/?location=${location.data.district}&adm=${location.data.city}&lang=zh&key=${config.HF_Key}`
      );
    } else if (location.data.province) {
      cityCodeRep = await fetch(
        `https://${config.HF_Host}/geo/v2/city/lookup/?location=${location.data.province}&lang=zh&key=${config.HF_Key}`
      );
    } else if (location.data.city) {
      cityCodeRep = await fetch(
        `https://${config.HF_Host}/geo/v2/city/lookup/?location=${location.data.city}&lang=zh&key=${config.HF_Key}`
      );
    } else {
      cityCodeRep = await fetch(
        `https://${config.HF_Host}/geo/v2/city/lookup/?location=${location.data.country}&lang=zh&key=${config.HF_Key}`
      );
    }
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

    weatherNow.value = weather.now; // 天气赋值成功
  } catch (e) {
    if (city.value === Unloaded.Loading) {
      city.value = Unloaded.Error;
    }
    weatherNow.value = Unloaded.Error;
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
  <div
    class="flip-container"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    :class="{ flipped: hover }"
  >
    <div class="clock-weather card">
      <div class="front">
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
              <span
                v-if="city.province && Zhixiashi.indexOf(city.province) == -1"
              >
                {{ city.province + " " }}
              </span>
              <span v-if="city.city">{{ city.city + " " }}</span>
              <span v-if="city.district">{{ city.district }}</span>
            </div>
            <div v-else-if="city === Unloaded.Loading" class="city">获取中...</div>
            <div v-else class="city">获取失败</div>

            <div
              v-if="
                weatherNow !== Unloaded.Loading && weatherNow !== Unloaded.Error
              "
              class="temperature"
              :title="`${weatherNow.text} ${weatherNow?.temp}°C`"
            >
              {{ weatherNow.text + " " + weatherNow?.temp }}°C
            </div>
            <div v-else class="temperature">--°C</div>
          </div>
          <button
            class="refresh-btn"
            @click="refreshWeather"
            :disabled="loading"
            :title="loading ? '刷新中...' : '刷新天气'"
          >
            <Icon icon="mdi:refresh" width="20" height="20" />
          </button>
        </div>
      </div>

      <div class="back">
        <slot name="back">
          <div style="text-align:center;">这里是背面内容</div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flip-container {
  width: 180px;
  height: 150px;
  perspective: 1000px;
  position: relative;
}

.clock-weather.card {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  transition: transform 1s;
  transform-style: preserve-3d;
  position: relative;
}

.flip-container.flipped .clock-weather.card {
  transform: rotateY(180deg);
}

.front,
.back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-wrap: wrap;
  left:0;
  top:0;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  padding: 15px;
}

.front {
  transform: rotateY(0deg);
  text-align: center;
}

.back {
  transform: rotateY(180deg);
}

/* 你已有的样式保留 */
.weather {
  display: flex;
  justify-content: center;
  align-items: center;
}
.weather-text{
  line-height: 26px;
}
.time {
  font-size: 30px;
  font-weight: 600;
  line-height: 32px;
}
.temperature,
.city {
  max-width: 90px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.refresh-btn {
  background: transparent;
  border: none;
  color: var(--font-color);
  cursor: pointer;
  margin-left: 8px;
  height: 24px;
  display: flex;
  align-items: center;
  padding: 0;
  transition: 0.3s;
}
.refresh-btn:hover:not(:disabled) {
  color: var(--font-color-hover);
  outline: none;
}
.refresh-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
