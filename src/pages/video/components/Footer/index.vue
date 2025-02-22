<template>
    <footer>
        <p>如果觉得这个脚本爆赞 👍</p>
        <p>请帮我点个 <a href="https://github.com/cbingb666/115Master" target="_blank">⭐</a> 支持我开发更多有趣的功能吧~</p>
        <div class="footer-tags">
            <!-- github -->
            <a :href="info.homepage" target="_blank">
                <img :src="`https://img.shields.io/badge/GitHub-115Master-yellow`" alt="GitHub">
            </a>

            <!-- version v1.0.0-beta -->
            <a :href="`https://github.com/cbingb666/115Master/releases/tag/v${info.version}`" target="_blank">
                <img :src="`https://img.shields.io/badge/Version-${info.version.replace(/-/g, '.')}-green`" alt="Version">
            </a>

            <!-- 作者 -->
            <a href="https://github.com/cbingb666" target="_blank">
                <img :src="`https://img.shields.io/badge/Author-${info.author}-red`" alt="Author">
            </a>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { GM_info } from "$";
import { computed } from "vue";

const info = computed(() => {
	return {
		version: GM_info.script.version,
		author: GM_info.script.author,
		homepage: GM_info.script.homepage,
	};
});
</script>

<style scoped>
footer {
    padding: 32px 0;
    color: #999;
    gap: 16px;
    text-align: center;
}

.footer-tags {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
}

p {
    font-size: 12px;
    a {
        color: yellow;
    }
}
</style>