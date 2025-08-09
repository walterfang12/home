<script setup lang="ts">
import { Icon } from "@iconify/vue";
import {
  ref,
  onMounted,
  computed,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { config } from "../config";

const songNameRef = ref<HTMLElement | null>(null);
const artistRef = ref<HTMLElement | null>(null);

const songNameTooLong = ref(false);
const artistTooLong = ref(false);

type PlayMode = "list" | "single" | "random";
const PMToCH = {
  list: "列表循环",
  single: "单曲循环",
  random: "随机播放",
};
const isOpen = ref(false);
const playlist = ref<any[]>([]);
const currentName = ref<string | null>(null);
const currentIndex = ref(0);
const isPlaying = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);
const volume = ref(0.5);
const progress = ref(0);
const duration = ref(0);
const playMode = ref<PlayMode>("list");

const radius = 22;
const circumference = 2 * Math.PI * radius;

const trackRefs = ref<HTMLElement[]>([]);

const playlistId = config.playlistIdWyy;
const metingApi = `https://api.injahow.cn/meting/?type=playlist&id=${playlistId}`;

const progressPercent = computed(() => {
  if (!duration.value || !isFinite(duration.value) || duration.value === 0)
    return 0;
  return Math.min(100, Math.max(0, (progress.value / duration.value) * 100));
});
const volumePercent = computed(() => volume.value * 100);
const playerContainerRef = ref<HTMLElement | null>(null);
const buttonRef = ref<HTMLElement | null>(null);

const onClickOutside = (event: MouseEvent) => {
  // 如果播放器是关闭的，不用处理
  if (!isOpen.value) return;
  // 判断点击元素是否在播放器内
  if (
    playerContainerRef.value &&
    !buttonRef.value?.contains(event.target as Node) &&
    !playerContainerRef.value.contains(event.target as Node) &&
    !(event.target as Element).parentElement?.classList.contains(
      "theme-switcher"
    ) &&
    !(event.target as Element).classList.contains("theme-switcher")
  ) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
});
const togglePlayer = () => {
  isOpen.value = !isOpen.value;
};

const playCurrent = () => {
  if (!playlist.value.length || !audioRef.value) return;

  currentIndex.value = playlist.value.findIndex(
    (s) => s.name === currentName.value
  );
  if (currentIndex.value === -1) {
    currentIndex.value = 0;
    currentName.value = playlist.value[0]?.name || null;
  }

  audioRef.value.src = playlist.value[currentIndex.value].url;
  audioRef.value.currentTime = 0;
  progress.value = 0;
  audioRef.value.play();
  saveState();
};

const selectTrack = (index: number) => {
  currentName.value = playlist.value[index]?.name || null;
  playCurrent();
};

const togglePlay = () => {
  if (!audioRef.value) return;
  if (isPlaying.value) {
    audioRef.value.pause();
  } else {
    audioRef.value.play();
  }
};

const onPlay = () => {
  isPlaying.value = true;
  saveState();
};
const onPause = () => {
  isPlaying.value = false;
  saveState();
};

const updateProgress = () => {
  if (!audioRef.value) return;
  progress.value = audioRef.value.currentTime;
  duration.value = audioRef.value.duration || 0;
  saveState();
};

const seek = (e: Event) => {
  const time = Number((e.target as HTMLInputElement).value);
  if (audioRef.value) {
    audioRef.value.currentTime = time;
  }
};

const changeVolume = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value) / 100;
  volume.value = val;
  if (audioRef.value) audioRef.value.volume = val;
  saveState();
};

const switchPlayMode = () => {
  if (playMode.value === "list") playMode.value = "single";
  else if (playMode.value === "single") playMode.value = "random";
  else playMode.value = "list";
  saveState();
};

const nextTrack = () => {
  if (!playlist.value.length) return;
  if (playMode.value === "single") {
    playCurrent();
  } else if (playMode.value === "random") {
    let nextIdx = currentIndex.value;
    while (nextIdx === currentIndex.value && playlist.value.length > 1) {
      nextIdx = Math.floor(Math.random() * playlist.value.length);
    }
    currentName.value = playlist.value[nextIdx].name;
    playCurrent();
  } else {
    let nextIdx = (currentIndex.value + 1) % playlist.value.length;
    currentName.value = playlist.value[nextIdx].name;
    playCurrent();
  }
};

const prevTrack = () => {
  if (!playlist.value.length) return;
  if (playMode.value === "random") {
    let prevIdx = currentIndex.value;
    while (prevIdx === currentIndex.value && playlist.value.length > 1) {
      prevIdx = Math.floor(Math.random() * playlist.value.length);
    }
    currentName.value = playlist.value[prevIdx].name;
    playCurrent();
  } else {
    let prevIdx =
      (currentIndex.value - 1 + playlist.value.length) % playlist.value.length;
    currentName.value = playlist.value[prevIdx].name;
    playCurrent();
  }
};

const formatTime = (sec: number) => {
  if (!sec || sec === Infinity) return "00:00";
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

const saveState = () => {
  if (currentName.value)
    localStorage.setItem("player-currentName", currentName.value);
  localStorage.setItem("player-progress", progress.value.toString());
  localStorage.setItem("player-isPlaying", isPlaying.value.toString());
  localStorage.setItem("player-volume", volume.value.toString());
  localStorage.setItem("player-playMode", playMode.value);
};

const loadState = () => {
  const savedName = localStorage.getItem("player-currentName");
  if (savedName) currentName.value = savedName;

  const savedProgress = localStorage.getItem("player-progress");
  if (savedProgress) progress.value = +savedProgress;

  const savedPlaying = localStorage.getItem("player-isPlaying");
  isPlaying.value = savedPlaying === "true";

  const savedVolume = localStorage.getItem("player-volume");
  if (savedVolume) volume.value = +savedVolume;

  const savedMode = localStorage.getItem("player-playMode");
  if (
    savedMode === "list" ||
    savedMode === "single" ||
    savedMode === "random"
  ) {
    playMode.value = savedMode;
  }
};

watch(currentIndex, async (newIndex) => {
  await nextTick();
  const el = trackRefs.value[newIndex];
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

const gotoCurrentSong = () => {
  const el = trackRefs.value[currentIndex.value];
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

const checkOverflow = (el: HTMLElement | null) => {
  if (!el) return false;
  return el.scrollWidth > el.clientWidth;
};

const updateMarqueeStatus = () => {
  songNameTooLong.value = checkOverflow(songNameRef.value);
  artistTooLong.value = checkOverflow(artistRef.value);
};

onMounted(async () => {
  const res = await fetch(metingApi);
  playlist.value = await res.json();

  loadState();

  if (!currentName.value && playlist.value.length) {
    currentName.value = playlist.value[0].name;
  }

  if (audioRef.value) {
    audioRef.value.volume = volume.value;
  }

  playCurrent();

  if (audioRef.value) {
    audioRef.value.currentTime = progress.value;
    if (isPlaying.value) {
      audioRef.value.play();
    }
  }
  if (audioRef.value) {
    audioRef.value.volume = volume.value;
    audioRef.value.currentTime = progress.value;

    audioRef.value.onloadedmetadata = () => {
      if (isPlaying.value) {
        audioRef.value?.play().catch(() => {
          isPlaying.value = false;
          saveState();
        });
      } else {
        audioRef.value?.pause();
      }
    };
  }
  nextTick(() => {
    updateMarqueeStatus();
    nextTick(() => updateMarqueeStatus());
  });
});
watch([() => playlist.value, currentIndex], () => {
  nextTick(updateMarqueeStatus);
});
window.addEventListener("resize", updateMarqueeStatus);
</script>

<template>
  <button
    class="player-button"
    @click="togglePlayer"
    :title="isOpen ? '隐藏播放器' : '打开播放器'"
    ref="buttonRef"
  >
    <svg
      v-if="isPlaying"
      class="progress-ring"
      width="42"
      height="42"
      viewBox="0 0 48 48"
    >
      <circle
        class="progress-ring__circle"
        stroke="var(--font-color)"
        stroke-width="3"
        fill="transparent"
        r="22"
        cx="24"
        cy="24"
        :style="{
          strokeDashoffset: circumference * (1 - progressPercent / 100) + 'px',
        }"
      />
    </svg>
    <Icon icon="mingcute:music-fill" width="24" height="24" />
  </button>

  <transition name="player-slide">
    <div v-if="isOpen" class="player-container" ref="playerContainerRef">
      <div class="player-pic" @dblclick="gotoCurrentSong">
        <img
          v-if="playlist.length"
          :src="playlist[currentIndex]?.pic"
          alt="cover"
          :class="{ rotating: isPlaying }"
        />
      </div>
      <div class="player-right">
        <div class="player-info">
          <div class="player-info">
            <component
              :is="songNameTooLong ? 'marquee' : 'div'"
              class="marquee name"
              ref="songNameRef"
            >
              {{ playlist[currentIndex]?.name || "加载中..." }}
            </component>
            <component
              :is="artistTooLong ? 'marquee' : 'div'"
              class="marquee artist"
              ref="artistRef"
            >
              {{ playlist[currentIndex]?.artist || "加载中..." }}
            </component>
          </div>
        </div>

        <div class="player-progress">
          <span class="time">{{ formatTime(progress) }}</span>
          <input
            type="range"
            min="0"
            :max="duration"
            :value="progress"
            @input="seek"
            :style="{
              background: `linear-gradient(to right, var(--font-color) ${progressPercent}%, var(--background-color) ${progressPercent}%)`,
            }"
          />
          <span class="time">{{ formatTime(duration) }}</span>
        </div>

        <div class="player-controls">
          <button class="player-control" @click="prevTrack" title="上一首">
            <Icon
              icon="material-symbols:skip-previous-rounded"
              width="24"
              height="24"
            />
          </button>
          <button
            class="player-control"
            @click="togglePlay"
            :title="isPlaying ? '暂停' : '播放'"
          >
            <Icon
              :icon="
                isPlaying
                  ? 'material-symbols:pause-rounded'
                  : 'material-symbols:play-arrow-rounded'
              "
              width="24"
              height="24"
            />
          </button>
          <button class="player-control" @click="nextTrack" title="下一首">
            <Icon
              icon="material-symbols:skip-next-rounded"
              width="24"
              height="24"
            />
          </button>

          <button
            class="player-control"
            @click="switchPlayMode"
            :title="`播放模式: ${PMToCH[playMode]}`"
            style="font-size: 20px"
          >
            <Icon
              :icon="
                playMode === 'list'
                  ? 'material-symbols:repeat-rounded'
                  : playMode === 'single'
                  ? 'material-symbols:repeat-one-rounded'
                  : 'material-symbols:shuffle-rounded'
              "
              width="24"
              height="24"
            />
          </button>

          <div class="player-volume" title="音量控制">
            <Icon icon="material-symbols:volume-up" width="24" height="24" />
            <input
              type="range"
              min="0"
              max="100"
              :value="volumePercent"
              @input="changeVolume"
              class="player-volume-slider"
              :title="`${volumePercent}%`"
              :style="{
                background: `linear-gradient(to right, var(--font-color) ${volumePercent}%, var(--background-color) ${volumePercent}%)`,
              }"
            />
          </div>
        </div>
      </div>

      <div class="player-musicselect">
        <div
          v-for="(song, index) in playlist"
          :key="song.url"
          class="track"
          :class="{ active: index === currentIndex }"
          @click="selectTrack(index)"
          :ref="
            (el) => {
              if (el) trackRefs[index] = el as HTMLElement;
              else trackRefs.splice(index, 1);
            }
          "
        >
          {{ song.name }} - {{ song.artist }}
        </div>
      </div>
    </div>
  </transition>
  <audio
    ref="audioRef"
    @play="onPlay"
    @pause="onPause"
    @ended="nextTrack"
    @timeupdate="updateProgress"
  ></audio>
</template>

<style scoped>
.player-button {
  position: fixed;
  top: 20px;
  right: 140px;
  width: 40px;
  height: 40px;
  box-sizing: border-box;
  border-radius: 50%;
  background-color: var(--background-color);
  box-shadow: var(--card-shadow);
  color: var(--font-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s;
  border: none;
}

.player-button:hover {
  background-color: var(--background-color-hover);
}

/* 进度圆环 */
.progress-ring {
  position: absolute;
  top: -1;
  left: -1;
  transform: rotate(-90deg); /* 让起点在顶部 */
  pointer-events: none; /* 不阻止按钮点击 */
}

.progress-ring__circle {
  transition: stroke-dashoffset 0.3s ease;
  stroke-linecap: round;
  stroke-dasharray: 138.23; /* circumference, 用JS设置也可 */
}

.player-container {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 300px;
  background: #fff6;
  box-shadow: var(--card-shadow);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 12px;
  backdrop-filter: blur(10px);
  z-index: 10;
  flex-wrap: wrap;
  transition: 0.3s;
}
[theme="dark"] .player-container {
  background: #0006;
}
.player-pic img {
  width: 100%;
  border-radius: 50%;
  border: 1px solid #fffa;
  animation-name: spin;
  animation-duration: 15s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-play-state: paused;
}
.player-pic img.rotating {
  animation-play-state: running;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.player-right {
  display: flex;
  flex-direction: column;
  width: calc(100% - 110px);
}

.player-info {
  display: flex;
  flex-direction: column;
  line-height: 24px;
  overflow: hidden;
  width: 100%;
}
.marquee {
  white-space: nowrap;
  text-overflow: clip;
  position: relative;
  will-change: transform;
}
.marquee.name {
  font-weight: bold;
}

.marquee.artist {
  font-size: 12px;
  color: gray;
  white-space: nowrap;
}
[theme="dark"] .marquee.artist {
  color: lightgray;
}

.player-controls {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.player-control {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--font-color);
  transition: 0.3s;
  padding: 0;
}
.player-control:hover {
  color: var(--font-color-hover);
  scale: 1.2;
}

.player-volume {
  display: flex;
  align-items: center;
  gap: 8px;
  transform: translateY(-2px);
}

.player-volume-slider {
  width: 40px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 2px;
  height: 6px;
  background: var(--background-color-hover);
  outline: none;
}
.player-volume-slider::-webkit-slider-thumb {
  opacity: 0;
}
.player-volume-slider::-moz-range-thumb {
  opacity: 0;
}

.player-progress {
  display: flex;
  align-items: center;
  gap: 3px;
}
.player-progress input {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  background: var(--background-color-hover);
  width: 100%;
}
.player-progress input::-webkit-slider-thumb {
  opacity: 0;
}
.player-progress input::-moz-range-thumb {
  opacity: 0;
}

.time {
  font-size: 12px;
  width: 36px;
  text-align: center;
  color: var(--font-color-secondary);
}

.player-musicselect {
  max-height: 120px;
  overflow-y: auto;
  border-top: 1px solid var(--background-color-hover);
  padding-top: 8px;
  width: 100%;
  font-size: 13px;
  color: var(--font-color);
  scrollbar-gutter: stable;
}

.track {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: 0.3s;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.track.active {
  background-color: var(--background-color);
  color: white;
}

.track:hover {
  background-color: var(--background-color-hover);
  color: white;
}
[theme="light"] .track.active,
[theme="light"] .track:hover {
  color: #0009;
}

/* 动画 */
.player-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.player-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.player-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.player-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.player-slide-enter-active,
.player-slide-leave-active {
  transition: all 0.3s ease;
}
@media screen and (max-width: 500px) {
  .player-button {
    width: 30px;
    height: 30px;
  }
  .progress-ring {
    width: 32px;
    height: 32px;
  }
  .player-container {
    width: calc(100% - 20px);
    top: 50px;
    left: 0;
    box-sizing: border-box;
    margin: 10px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .player-pic {
    width: 80px;
    height: 80px;
  }
  .player-right {
    width: 100%;
  }
  .player-info {
    text-align: center;
  }
}
@media screen and (max-height: 440px) {
  .player-button {
    top: 20px;
    right: 140px;
  }
  .player-button {
    width: 30px;
    height: 30px;
  }
  .progress-ring {
    width: 32px;
    height: 32px;
  }
  .player-container {
    width: calc(100% - 20px);
    top: 50px;
    left: 0;
    box-sizing: border-box;
    margin: 10px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .player-pic {
    width: 80px;
    height: 80px;
  }
  .player-right {
    width: 100%;
  }
  .player-info {
    text-align: center;
  }
  .player-container {
    height: calc(100% - 70px);
  }
  .player-musicselect {
    height: 0;
    flex: 1;
  }
}
@media screen and (max-width: 220px) {
  .player-volume {
    display: none;
  }
}
</style>
