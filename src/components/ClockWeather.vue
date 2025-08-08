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

onMounted(async () => {
  updateTimeDate();
  const timer = setInterval(updateTimeDate, 1000);
  onUnmounted(() => clearInterval(timer));
  const locationRep = await fetch("https://my.ip.cn/json/");
  city.value = Unloaded.Loading;
  weatherNow.value = Unloaded.Loading;
  let location: LocationRep;
  if (locationRep.ok && locationRep.status === 200) {
    location = await locationRep.json();
    if (!location.status) {
      city.value = Unloaded.Error;
      weatherNow.value = Unloaded.Error;
      return;
    }
    city.value = location.data;
  } else {
    city.value = Unloaded.Error;
    weatherNow.value = Unloaded.Error;
    return;
  }
  const cityCodeRep = await fetch(
    `https://${config.HF_Host}/geo/v2/city/lookup/?location=${location.data.district}&adm=${location.data.city}&key=${config.HF_Key}`
  );
  let cityCodeJson: CityCodeRep, cityCode: string;
  if (cityCodeRep.ok && cityCodeRep.status === 200) {
    cityCodeJson = await cityCodeRep.json();
    if (cityCodeJson.code !== "200") {
      weatherNow.value = Unloaded.Error;
      return;
    }
    cityCode = cityCodeJson.location[0]?.id;
  } else {
    weatherNow.value = Unloaded.Error;
    return;
  }
  const weatherRep = await fetch(
    `https://${config.HF_Host}/v7/weather/now?location=${cityCode}&key=${config.HF_Key}`
  );
  let weather: WeatherRep;
  if (weatherRep.ok && weatherRep.status === 200) {
    weather = await weatherRep.json();
    if (weather.code !== "200") {
      weatherNow.value = Unloaded.Error;
      return;
    }
    weatherNow.value = weather.now;
  } else {
    weatherNow.value = Unloaded.Error;
    return;
  }
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
          <span v-if="city.country !== '中国'">
            {{ city.country + " " }}
          </span>
          <span v-if="Zhixiashi.indexOf(city.province) == -1">
            {{ city.province + " " }}
          </span>
          <span>
            {{ city.city + " " }}
          </span>
          <span>
            {{ city.district }}
          </span>
        </div>
        <div v-else-if="city === Unloaded.Loading" class="city">
          城市获取中...
        </div>
        <div v-else class="city">城市获取失败</div>
        <div
          v-if="
            weatherNow !== Unloaded.Loading && weatherNow !== Unloaded.Error
          "
          class="temperature"
        >
          {{ weatherNow.text + " " + weatherNow?.temp }}°C
        </div>
        <div v-else class="temperature">
          {{
            weatherNow === Unloaded.Error ? "获取失败 --°C" : "获取中... --°C"
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
@media screen and (max-width: 300px) {
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
