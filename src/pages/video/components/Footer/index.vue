<template>
    <footer :class="styles.container.main">
        <p :class="styles.text.description">如果觉得这个脚本爆赞 👍</p>
        <p :class="styles.text.description">
            请帮我点个 
            <a :href="info.homepage" target="_blank" :class="styles.text.link">⭐</a> 
            支持我开发更多有趣的功能吧~
        </p>
        <div :class="styles.badges.container">
            <!-- github -->
            <a :href="info.homepage" target="_blank" :class="styles.badges.link">
                <img :src="`https://img.shields.io/badge/GitHub-115Master-yellow`" alt="GitHub" :class="styles.badges.image">
            </a>

            <!-- version v1.0.0-beta -->
            <a :href="`https://github.com/cbingb666/115Master/releases/tag/v${info.version}`" target="_blank" :class="styles.badges.link">
                <img :src="`https://img.shields.io/badge/Version-${info.version.replace(/-/g, '.')}-green`" alt="Version" :class="styles.badges.image">
            </a>

            <!-- 作者 -->
            <a href="https://github.com/cbingb666" target="_blank" :class="styles.badges.link">
                <img :src="`https://img.shields.io/badge/Author-${info.author}-red`" alt="Author" :class="styles.badges.image">
            </a>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { GM_info } from "$";
import { computed } from "vue";

const styles = {
	// 容器样式
	container: {
		main: "py-8 text-base-content/60 gap-4 text-center flex flex-col",
	},
	// 文本样式
	text: {
		description: "text-xs",
		link: "text-yellow-400 hover:text-yellow-300 transition-colors duration-200",
	},
	// 徽章样式
	badges: {
		container: "flex items-center justify-center gap-4 flex-wrap",
		link: "inline-block hover:scale-105 transition-transform duration-200",
		image: "h-5",
	},
};

const info = computed(() => {
	return {
		version: GM_info.script.version,
		author: GM_info.script.author,
		homepage: GM_info.script.homepage,
	};
});
</script>