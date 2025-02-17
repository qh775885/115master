<script setup lang="ts">
import Empty from "./Empty.vue";
</script>

<template>
  <div class="demo-container">
    <h2>空状态组件示例</h2>

    <!-- 基础用法 -->
    <section class="demo-section">
      <h3>基础用法</h3>
      <div class="demo-box">
        <Empty />
      </div>
    </section>

    <!-- 自定义文本 -->
    <section class="demo-section">
      <h3>自定义文本</h3>
      <div class="demo-box">
        <Empty description="暂无搜索结果" />
      </div>
    </section>

    <!-- 自定义图片 -->
    <section class="demo-section">
      <h3>自定义图片</h3>
      <div class="demo-box">
        <Empty
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          description="暂无数据"
        />
      </div>
    </section>

    <!-- 不显示图片 -->
    <section class="demo-section">
      <h3>不显示图片</h3>
      <div class="demo-box">
        <Empty :show-image="false" description="暂无通知" />
      </div>
    </section>

    <!-- 自定义内容 -->
    <section class="demo-section">
      <h3>自定义内容</h3>
      <div class="demo-box">
        <Empty description="暂无数据">
          <button class="demo-button">添加数据</button>
        </Empty>
      </div>
    </section>

    <!-- 列表为空 -->
    <section class="demo-section">
      <h3>列表为空</h3>
      <div class="demo-box list-container">
        <Empty description="暂无列表数据">
          <button class="demo-button">创建新项目</button>
        </Empty>
      </div>
    </section>
  </div>
</template>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.demo-section {
  margin-bottom: 32px;

  h3 {
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 500;
  }
}

.demo-box {
  padding: 24px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
}

.list-container {
  min-height: 300px;
}

.demo-button {
  padding: 8px 16px;
  background: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background: #4096ff;
  }
}
</style> 