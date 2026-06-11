<template>
  <el-form ref="formRef" :model="form" label-width="112px" class="report-form">
    <el-divider content-position="left">机构信息</el-divider>

    <el-form-item label="公司名称" required>
      <el-input v-model="form.name" placeholder="请输入非法中介或公司名称" clearable />
    </el-form-item>

    <el-form-item label="所在省市" required>
      <el-cascader
        v-model="form.location"
        :options="cityOptions"
        placeholder="选择省市"
        clearable
        filterable
      />
    </el-form-item>

    <el-form-item label="位置模式">
      <el-segmented v-model="locationMode" :options="locationModeOptions" @change="handleModeChange" />
    </el-form-item>

    <template v-if="locationMode === 'manual'">
      <el-form-item label="公司地址" required>
        <el-input v-model="form.companyAddress" placeholder="如：某某路 88 号某大厦" clearable />
      </el-form-item>
    </template>

    <template v-else>
      <el-form-item label="地图标点" required>
        <div class="map-picker">
          <div ref="mapContainerRef" class="map-container"></div>
          <div class="map-meta">
            <el-tag v-if="form.mapPoint" type="success">
              {{ form.mapPoint.lng.toFixed(6) }}, {{ form.mapPoint.lat.toFixed(6) }}
            </el-tag>
            <span v-else>点击地图标记公司位置</span>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="地图地址">
        <el-input v-model="form.mapAddress" placeholder="地图识别地址，可手动修正" clearable />
      </el-form-item>
    </template>

    <el-form-item label="详细地址" required>
      <el-input v-model="form.detailAddress" placeholder="如：写字楼名称、园区、街区、附近地标" clearable />
    </el-form-item>

    <el-form-item label="楼层门牌号">
      <el-input v-model="form.floorRoom" placeholder="如：12 楼 1208 室、A 座 3 层" clearable />
    </el-form-item>

    <el-divider content-position="left">证据与人员信息</el-divider>

    <el-form-item label="法人姓名">
      <el-input v-model="form.legalPersonName" placeholder="已知则填写法人、负责人或实际控制人姓名" clearable />
    </el-form-item>

    <el-form-item label="法人证件">
      <el-input v-model="form.legalPersonId" placeholder="身份证号、营业执照统一社会信用代码等，未知可不填" clearable />
    </el-form-item>

    <el-form-item label="联系电话">
      <el-input v-model="form.legalPersonPhone" placeholder="法人、负责人或业务员联系电话" clearable />
    </el-form-item>

    <el-form-item label="联系账号">
      <el-input v-model="form.contactPhone" placeholder="微信、QQ、手机号、APP 账号等" clearable />
    </el-form-item>

    <el-form-item label="线索描述" required>
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="5"
        placeholder="请描述非法中介行为：收费项目、承诺内容、收款方式、沟通过程、受害金额等"
      />
    </el-form-item>

    <el-form-item label="补充线索">
      <el-input
        v-model="form.businessClues"
        type="textarea"
        :rows="3"
        placeholder="可补充营业执照信息、关联人员、银行卡/收款账户、网站链接、社交账号等"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" :loading="submitting" :disabled="submitting" @click="submit">
        提交举报
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import type { ReportFormData } from '@/types/report'
import { submitReport } from '@/services/reportService'

declare const AMap: any

const emit = defineEmits<{
  (e: 'submitted', payload: { id: string }): void
}>()

const formRef = ref()
const mapContainerRef = ref<HTMLElement>()
const submitting = ref(false)
const locationMode = ref<'manual' | 'map'>('manual')
const mapLoaded = ref(false)
let mapInstance: any = null
let markerInstance: any = null

const locationModeOptions = [
  { label: '手动输入', value: 'manual' },
  { label: '地图标点', value: 'map' },
]

const form = reactive<ReportFormData>({
  name: '',
  location: [],
  address: '',
  companyAddress: '',
  detailAddress: '',
  floorRoom: '',
  mapPoint: null,
  mapAddress: '',
  legalPersonName: '',
  legalPersonId: '',
  legalPersonPhone: '',
  contactPhone: '',
  description: '',
  businessClues: '',
  photoNames: [],
})

const cityOptions = [
  { value: '广东省', label: '广东省', children: [{ value: '深圳市', label: '深圳市' }, { value: '广州市', label: '广州市' }] },
  { value: '北京市', label: '北京市', children: [{ value: '北京市', label: '北京市' }] },
  { value: '上海市', label: '上海市', children: [{ value: '上海市', label: '上海市' }] },
  { value: '浙江省', label: '浙江省', children: [{ value: '杭州市', label: '杭州市' }, { value: '宁波市', label: '宁波市' }] },
  { value: '江苏省', label: '江苏省', children: [{ value: '南京市', label: '南京市' }, { value: '苏州市', label: '苏州市' }] },
]

function handleModeChange() {
  if (locationMode.value === 'map') {
    nextTick(initMapPicker)
  }
}

function loadAmapScript() {
  if ((window as any).AMap) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-amap-report-picker="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('地图加载失败')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=7f06493bcc50ca65ec455558e170d017&plugin=AMap.Geocoder'
    script.async = true
    script.dataset.amapReportPicker = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('地图加载失败'))
    document.head.appendChild(script)
  })
}

async function initMapPicker() {
  if (!mapContainerRef.value || mapLoaded.value) {
    return
  }

  try {
    await loadAmapScript()
    mapInstance = new AMap.Map(mapContainerRef.value, {
      zoom: 12,
      center: [114.0579, 22.5431],
    })

    mapInstance.on('click', (event: any) => {
      const point = {
        lng: event.lnglat.getLng(),
        lat: event.lnglat.getLat(),
      }
      setMapPoint(point)
      reverseGeocode(point)
    })

    mapLoaded.value = true
  } catch {
    ElMessage.error('地图加载失败，请先使用手动输入模式提交地址')
  }
}

function setMapPoint(point: { lng: number; lat: number }) {
  form.mapPoint = point

  if (!mapInstance) return

  if (!markerInstance) {
    markerInstance = new AMap.Marker({
      map: mapInstance,
      position: [point.lng, point.lat],
    })
  } else {
    markerInstance.setPosition([point.lng, point.lat])
  }
}

function reverseGeocode(point: { lng: number; lat: number }) {
  if (!(window as any).AMap?.Geocoder) {
    form.mapAddress = `${point.lng.toFixed(6)}, ${point.lat.toFixed(6)}`
    return
  }

  const geocoder = new AMap.Geocoder()
  geocoder.getAddress([point.lng, point.lat], (status: string, result: any) => {
    if (status === 'complete' && result?.regeocode?.formattedAddress) {
      form.mapAddress = result.regeocode.formattedAddress
    } else {
      form.mapAddress = `${point.lng.toFixed(6)}, ${point.lat.toFixed(6)}`
    }
  })
}

function getNormalizedAddress() {
  const locationAddress = locationMode.value === 'map'
    ? form.mapAddress?.trim()
    : form.companyAddress?.trim()

  return [locationAddress, form.detailAddress?.trim(), form.floorRoom?.trim()]
    .filter(Boolean)
    .join(' ')
}

function validateForm() {
  const name = form.name.trim()
  const description = form.description.trim()
  const detailAddress = form.detailAddress?.trim()
  const hasManualAddress = locationMode.value === 'manual' && !!form.companyAddress?.trim()
  const hasMapPoint = locationMode.value === 'map' && !!form.mapPoint

  if (!name || !form.location.length || !detailAddress || !description || (!hasManualAddress && !hasMapPoint)) {
    ElMessage.warning('请完善公司名称、位置、详细地址和线索描述后再提交')
    return false
  }

  return true
}

function resetForm() {
  form.name = ''
  form.location = []
  form.address = ''
  form.companyAddress = ''
  form.detailAddress = ''
  form.floorRoom = ''
  form.mapPoint = null
  form.mapAddress = ''
  form.legalPersonName = ''
  form.legalPersonId = ''
  form.legalPersonPhone = ''
  form.contactPhone = ''
  form.description = ''
  form.businessClues = ''
  form.photoNames = []

  if (markerInstance) {
    markerInstance.setMap(null)
    markerInstance = null
  }
}

async function submit() {
  if (submitting.value || !validateForm()) {
    return
  }

  submitting.value = true
  try {
    form.address = getNormalizedAddress()

    const record = await submitReport({
      ...form,
      name: form.name.trim(),
      address: form.address,
      description: form.description.trim(),
    })

    ElMessage.success(`提交成功，编号：${record.id}`)
    emit('submitted', { id: record.id })
    resetForm()
  } catch {
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.report-form {
  max-width: 100%;
}

.map-picker {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.map-container {
  width: 100%;
  height: 320px;
}

.map-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 40px;
  padding: 8px 12px;
  color: #606266;
  border-top: 1px solid #ebeef5;
}

:deep(.el-cascader),
:deep(.el-segmented) {
  width: 100%;
}

@media (max-width: 768px) {
  :deep(.el-form) {
    --el-form-label-width: 0;
  }

  :deep(.el-form-item) {
    display: block;
  }

  :deep(.el-form-item__label) {
    display: block;
    width: 100% !important;
    margin-bottom: 6px;
    justify-content: flex-start;
    text-align: left;
  }

  :deep(.el-cascader),
  :deep(.el-input),
  :deep(.el-textarea),
  :deep(.el-button),
  :deep(.el-segmented) {
    width: 100%;
  }

  .map-container {
    height: 280px;
  }
}
</style>
