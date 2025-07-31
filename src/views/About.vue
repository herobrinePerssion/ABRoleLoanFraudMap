<template>
    <el-main>
      <!-- 标题 -->
      <el-page-header content="关于 AB 贷诈骗" />

      <!-- 简介 -->
      <el-card class="intro-card" shadow="hover">
        <div class="intro-content">
          <div class="text">
            <h2>什么是 AB 贷？</h2>
            <p>
              AB 贷是一种常见的金融诈骗手法，诈骗分子通过伪装成贷款中介，以提高信用额度、代办军人贷、低息贷等名义引诱受害人申请多笔贷款。A 贷作为表面借款，B 贷作为隐性套现，最终受害人背上多笔债务，而诈骗分子卷款潜逃。
            </p>
          </div>
          <img src="https://img1.imgtp.com/2023/06/01/VZubjTWa.png" alt="ab贷套路图" />
        </div>
      </el-card>

      <!-- 套路流程 -->
      <el-card class="timeline-card" shadow="hover">
        <h3>诈骗常见流程</h3>
        <el-timeline>
          <el-timeline-item timestamp="第一步" placement="top">
            <el-icon><ChatLineRound /></el-icon>
            通过社交平台、短视频、微信等方式发布“代办信用贷”“军人贷”等广告。
          </el-timeline-item>
          <el-timeline-item timestamp="第二步" placement="top">
            <el-icon><UserFilled /></el-icon>
            诈骗分子伪装成专业贷款中介或军官身份获取信任。
          </el-timeline-item>
          <el-timeline-item timestamp="第三步" placement="top">
            <el-icon><DocumentChecked /></el-icon>
            引导受害人提供征信信息、身份证照片等资料，远程办理贷款。
          </el-timeline-item>
          <el-timeline-item timestamp="第四步" placement="top">
            <el-icon><Money /></el-icon>
            引导申请 A 贷后，再通过 B 贷套现“还款”，造成假象，实际资金被转移。
          </el-timeline-item>
          <el-timeline-item timestamp="第五步" placement="top">
            <el-icon><CircleClose /></el-icon>
            贷款成功后中介失联，受害人独自承担全部债务。
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 案例展示 -->
      <el-row :gutter="20" class="case-list">
        <el-col :span="12" v-for="(item, index) in cases" :key="index">
          <el-card shadow="hover" class="case-card">
            <h4>{{ item.title }}</h4>
            <p>{{ item.description }}</p>
            <el-tag type="danger" effect="dark">{{ item.region }}</el-tag>
          </el-card>
        </el-col>
      </el-row>

      <!-- 引用与参考资料 -->
      <el-card class="reference-card" shadow="never">
        <h3>参考资料</h3>
        <ul>
          <li><el-link href="https://www.chinacourt.org/article/detail/2024/02/id/7372912.shtml" target="_blank">《关于打击非法放贷的通告》</el-link></li>
          <li><el-link href="https://finance.sina.com.cn/chanjing/b/2023-05-15/doc-imytqsvm1855086.shtml" target="_blank">新浪财经 - 多人被骗“军官贷”内幕曝光</el-link></li>
          <li><el-link href="https://news.cctv.com/2023/03/21/ARTI4jfYLiT3HUG9E8k7WDFZ230321.shtml" target="_blank">央视新闻 - AB贷“空手套白狼”揭秘</el-link></li>
        </ul>
      </el-card>
    </el-main>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import {
  ChatLineRound,
  UserFilled,
  DocumentChecked,
  Money,
  CircleClose
} from '@element-plus/icons-vue'

const cases = ref([
  {
    title: '案例一：上海受害者朱某被骗78万元',
    description: '朱某在抖音上添加“军官贷”客服，被骗提供征信后陆续贷款十几笔，最严重一笔贷款达15万元，最终债务高达78万元。',
    region: '上海'
  },
  {
    title: '案例二：安徽大学生被以“提高信用”为由骗贷30万',
    description: '犯罪团伙以代办“公务员贷”为由，通过电话诱导大学生分批贷款，成功后失联。',
    region: '安徽'
  }
])
</script>

<style lang="scss" scoped>
.about-page {
  padding: 20px;

  .intro-card {
    margin-bottom: 30px;

    .intro-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .text {
        flex: 1;
        padding-right: 20px;
      }

      img {
        width: 320px;
        height: auto;
        border-radius: 8px;
      }
    }
  }

  .timeline-card {
    margin-bottom: 30px;
  }

  .case-list {
    margin-bottom: 30px;

    .case-card {
      height: 180px;
    }
  }

  .reference-card {
    ul {
      padding-left: 20px;
      li {
        margin-bottom: 8px;
      }
    }
  }
}
</style>
