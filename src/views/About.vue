<template>
  <el-main class="about-page">
    <el-page-header content="关于 AB 贷诈骗" />

    <el-card class="intro-card" shadow="hover">
      <div class="intro-content">
        <div class="text">
          <h2>什么是 AB 贷诈骗？</h2>
          <p>
            AB 贷诈骗通常由“贷款方 A + 伪担保方 B”共同实施。诈骗分子先以“低息、秒批、黑户可贷”吸引用户，
            再以“保证金、解冻金、刷流水、担保费”等理由层层收费，最终不放款或诱导受害人承担多笔高额债务。
          </p>
          <el-alert
            type="warning"
            :closable="false"
            show-icon
            title="关键识别点：正规金融机构不会在放款前要求私人账户转账。"
          />
        </div>
        <img src="https://img1.imgtp.com/2023/06/01/VZubjTWa.png" alt="ab贷套路图" />
      </div>
    </el-card>

    <el-row :gutter="20" class="panel-row">
      <el-col :xs="24" :md="14">
        <el-card class="timeline-card" shadow="hover">
          <h3>常见诈骗流程</h3>
          <el-timeline>
            <el-timeline-item timestamp="1" placement="top">
              <el-icon><ChatLineRound /></el-icon>
              在短视频/社交平台投放“高通过率贷款”广告。
            </el-timeline-item>
            <el-timeline-item timestamp="2" placement="top">
              <el-icon><UserFilled /></el-icon>
              伪装银行经理、军官或官方客服建立信任。
            </el-timeline-item>
            <el-timeline-item timestamp="3" placement="top">
              <el-icon><DocumentChecked /></el-icon>
              索要身份证、银行卡、征信与验证码等敏感信息。
            </el-timeline-item>
            <el-timeline-item timestamp="4" placement="top">
              <el-icon><Money /></el-icon>
              诱导先支付费用或继续办理 B 贷“覆盖前账”。
            </el-timeline-item>
            <el-timeline-item timestamp="5" placement="top">
              <el-icon><CircleClose /></el-icon>
              失联或继续施压转账，受害人背负真实债务。
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="10">
        <el-card class="checklist-card" shadow="hover">
          <h3>防骗自检清单</h3>
          <el-space direction="vertical" fill>
            <el-tag type="danger">放款前收费 = 高危诈骗信号</el-tag>
            <el-tag type="danger">要求屏幕共享/远程控制 = 高危</el-tag>
            <el-tag type="warning">合同条款不完整或模糊 = 高风险</el-tag>
            <el-tag type="warning">客服催促“立刻转账” = 高风险</el-tag>
            <el-tag>所有沟通与转账记录请及时留存</el-tag>
          </el-space>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="case-list">
      <el-col :xs="24" :md="12" v-for="(item, index) in cases" :key="index">
        <el-card shadow="hover" class="case-card">
          <h4>{{ item.title }}</h4>
          <p>{{ item.description }}</p>
          <el-tag type="danger" effect="dark">{{ item.region }}</el-tag>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="reference-card" shadow="never">
      <h3>参考与科普</h3>
      <ul>
        <li><el-link href="https://www.chinacourt.org/article/detail/2024/02/id/7372912.shtml" target="_blank">《关于打击非法放贷的通告》</el-link></li>
        <li><el-link href="https://finance.sina.com.cn/chanjing/b/2023-05-15/doc-imytqsvm1855086.shtml" target="_blank">新浪财经 - “军官贷”骗局曝光</el-link></li>
        <li><el-link href="https://news.cctv.com/2023/03/21/ARTI4jfYLiT3HUG9E8k7WDFZ230321.shtml" target="_blank">央视新闻 - AB贷套路解析</el-link></li>
      </ul>
    </el-card>
  </el-main>
</template>
<script setup lang="ts">
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
  padding: 0 20px 20px;

  .intro-card {
    margin-bottom: 20px;

    .intro-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;

      .text {
        flex: 1;
        padding-right: 8px;
      }

      img {
        width: 300px;
        height: auto;
        border-radius: 8px;
      }
    }
  }

  .panel-row {
    margin-bottom: 20px;
  }

  .timeline-card {
    height: 100%;
  }

  .checklist-card {
    height: 100%;
  }

  .case-list {
    margin-bottom: 20px;

    .case-card {
      min-height: 170px;
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

@media (max-width: 992px) {
  .about-page {
    padding: 0 12px 16px;

    .intro-card .intro-content {
      flex-direction: column;

      img {
        width: 100%;
        max-width: 420px;
      }
    }
  }
}

@media (max-width: 768px) {
  .about-page {
    :deep(.el-card__header),
    :deep(.el-card__body) {
      padding: 14px;
    }

    .intro-card .intro-content {
      gap: 12px;

      .text {
        padding-right: 0;
        min-width: 0;
      }

      img {
        max-width: 100%;
      }
    }

    .case-card {
      min-height: 0;
      margin-bottom: 12px;
    }

    .reference-card ul {
      padding-left: 18px;
    }
  }
}
</style>
