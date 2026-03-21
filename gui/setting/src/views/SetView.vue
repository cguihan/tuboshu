<script setup>
import iconCancel from "@/components/icons/cancel.vue";
const message = useMessage();
const settings = ref({})

const isShow = ref(false);
const btnLoading = ref(false);
const btnText = ref("清除缓存");
const isEdgeAdsorption = ref(false)
const isMemoryOptimizationEnabled = ref(false)
const isOpenDevTools = ref(false)
const isOpenZoom = ref(false)
const isAutoLaunch = ref(false)
const isMenuVisible = ref(true)
const isOpenContextMenu = ref(true)
const systemTheme = ref("system")
const leftMenuPosition = ref('left')
const howLinkOpenMethod = ref('tuboshu')
const defaultWindowSize = ref({width: 1024, height: 800})

// 地址管理相关
const insecureOriginUrls = ref('')
const newUrl = ref('')

const version = ref({
  version: '加载中...',
  electron: '--',
  chrome: '--'
})

const themes = [
  {label: '跟随系统', value: 'system'},
  {label: '普通模式', value: 'light'},
  {label: '深度模式', value: 'dark'}
]
const leftMenu = [
    {label: '左侧', value: 'left'},
    {label: '右侧', value: 'right'}
]
const linkOpenMethod = [
  {label: 'Tuboshu弹窗', value: 'tuboshu'},
  {label: '默认浏览器', value: 'browser'}
]


const getValue= (name, obj) => {
  let item = obj.value.find((item) => item.name === name);
  if(typeof item.value === 'number') return item.value !== 0;
  if(typeof item.value === 'string' && item.value === "0") return false;
  return item.value;
}

onMounted(async () => {
  version.value = await window.myApi.getVersion();
  settings.value = await window.myApi.getSettings();

  isEdgeAdsorption.value = getValue('isWindowEdgeAdsorption', settings);
  isMemoryOptimizationEnabled.value = getValue('isMemoryOptimizationEnabled', settings);
  leftMenuPosition.value = getValue('leftMenuPosition', settings);
  systemTheme.value = getValue('systemTheme', settings);
  isMenuVisible.value = getValue('isMenuVisible', settings);
  isOpenDevTools.value = getValue('isOpenDevTools', settings);
  isOpenZoom.value = getValue('isOpenZoom', settings);
  isOpenContextMenu.value = getValue('isOpenContextMenu', settings);
  isAutoLaunch.value = getValue('isAutoLaunch', settings);
  defaultWindowSize.value = getValue('defaultWindowSize', settings);
  howLinkOpenMethod.value = getValue('howLinkOpenMethod', settings);
  insecureOriginUrls.value = getValue('insecureOriginUrls', settings);
})



const changeSwitch = async (val) => {
  const setting = { name : 'isWindowEdgeAdsorption', value: val ? 1 : 0}
  window.myApi.updateSetting(setting);
  message.success(`设置已更新,请重新启动`)
}

const changeOptimize = async (val) => {
  const setting = { name : 'isMemoryOptimizationEnabled', value: val ? 1 : 0}
  window.myApi.updateSetting(setting);
  message.success(`设置已更新,请重新启动`)
}

const changeMenuVisible = (val) => {
  window.myApi.updateSetting({ name : 'isMenuVisible', value: val ? 1 : 0});
  message.success(`设置已更新,请重新启动`)
}

const changeDevTools = (val) => {
  window.myApi.updateSetting({ name : 'isOpenDevTools', value: val ? 1 : 0});
  message.success(`设置已更新,请重新启动`)
}

const changeZoom= (val) => {
  window.myApi.updateSetting({ name : 'isOpenZoom', value: val ? 1 : 0});
  message.success(`设置已更新,请重新启动`)
}

const changeContextMenu= (val) => {
  window.myApi.updateSetting({ name : 'isOpenContextMenu', value: val ? 1 : 0});
  message.success(`设置已更新,请重新启动`)
}

const changeAutoLaunch= (val) => {
  window.myApi.updateSetting({ name : 'isAutoLaunch', value: val ? 1 : 0});
  message.success(`设置已更新,请重新启动`)
}


const changeTheme = (e) => {
  window.myApi.updateSetting({ name : 'systemTheme', value: e.target.value});
  message.success(`设置已更新,请重新启动`)
}

const changeMenuPos = (e) => {
  window.myApi.updateSetting({ name : 'leftMenuPosition', value:e.target.value});
  message.success(`设置已更新,请重新启动`)
}

const changeLinkOpenMethod = (e) => {
  window.myApi.updateSetting({ name : 'howLinkOpenMethod', value:e.target.value});
  message.success(`设置已更新,请重新启动`)
}

const handleWinChange = (e) => {
  const { value, placeholder } = e.target;
  const key = placeholder === 'width' ? 'width' : 'height';
  const numValue = Number(value);
  let setting = {};

  if (isNaN(numValue) || numValue <= 0) {
    message.error('请输入有效的正数');
    return;
  }

  if(key === 'width'){
    if(numValue > 3000){
      message.error('宽度不能超过3000px');
      return;
    }
    if(numValue < 300){
      message.error('宽度不能小于300px');
      return;
    }
    setting = {width: numValue, height: Number(defaultWindowSize.value.height)}
  }

  if(key === 'height'){
    if(numValue > 2000){
      message.error('高度不能超过2000px');
      return;
    }
    if (numValue < 300){
      message.error('高度不能小于300px');
      return;
    }
    setting = {width: Number(defaultWindowSize.value.width), height: numValue};
  }
  window.myApi.updateSetting({ name : 'defaultWindowSize', value: setting});
  message.success(`设置已更新,请重新启动`)
}

const handleBtnClick = async ()=> {
  btnLoading.value = true;
  btnText.value = '正在清除缓存';
  await window.myApi.clearCache()
  setTimeout(() => {
    btnLoading.value = false;
    btnText.value = '清除缓存';
    message.success(`Tuboshu缓存已清除`)
    }, 2e3);
}

const addUrl = () => {
  const url = newUrl.value.trim();
  if (!url) {
    message.error('请输入有效的地址');
    return;
  }
  
  // 验证URL格式
  if (!url.match(/^https?:\/\/.+/)) {
    message.error('请输入以 http:// 或 https:// 开头的地址');
    return;
  }
  
  const urls = insecureOriginUrls.value ? insecureOriginUrls.value.split(',').map(u => u.trim()) : [];
  
  if (urls.includes(url)) {
    message.error('该地址已存在');
    return;
  }
  
  urls.push(url);
  insecureOriginUrls.value = urls.join(',');
  newUrl.value = '';
  message.success('地址已添加');
}

const removeUrl = (urlToRemove) => {
  const urls = insecureOriginUrls.value.split(',').map(u => u.trim());
  const index = urls.indexOf(urlToRemove);
  if (index > -1) {
    urls.splice(index, 1);
    insecureOriginUrls.value = urls.join(',');
    message.success('地址已移除');
  }
}

const saveUrls = () => {
  window.myApi.updateSetting({ name : 'insecureOriginUrls', value: insecureOriginUrls.value});
  message.success(`设置已更新,请重新启动`)
}

const getUrlList = computed(() => {
  return insecureOriginUrls.value ? insecureOriginUrls.value.split(',').map(u => u.trim()).filter(u => u) : [];
})

const  handleSponsorClick = () =>{
  isShow.value = true;
}
const handleClose = () =>{
  isShow.value = false;
}

</script>

<template>
  <div id="content-main">
    <n-alert :show-icon="false" type="info" style="margin-bottom: 1rem;">
      <n-h3 style="margin-bottom: 0;">通用设置</n-h3>
    </n-alert>

    <n-card embedded :bordered="true" style="margin-top:1rem;">
      <div class="wrap">

        <div class="card">
          <div class="vleft">启动窗口：</div>
          <div class="vright">
            <n-input-group @change="handleWinChange">
              <n-input size="small"
                       v-model:value="defaultWindowSize.width"
                       :style="{ width: '20%' }"
                       placeholder="width"  /> x
              <n-input size="small"
                       v-model:value="defaultWindowSize.height"
                       :style="{ width: '20%' }"
                       placeholder="height" />
            </n-input-group>
          </div>
        </div>

        <div class="card">
          <div class="vleft">开机启动：</div>
          <div class="vright">
            <n-switch size="medium"
                      v-model:value="isAutoLaunch"
                      @update:value="changeAutoLaunch" style="font-size:12px;" >
              <template #checked>开启</template>
              <template #unchecked>关闭</template>
            </n-switch>
          </div>
        </div>
        <div class="card">
          <div class="vleft">调试模式：</div>
          <div class="vright">
            <n-switch size="medium"
                      v-model:value="isOpenDevTools"
                      @update:value="changeDevTools" style="font-size:12px;" >
              <template #checked>开启</template>
              <template #unchecked>关闭</template>
            </n-switch>
          </div>
        </div>

        <div class="card">
          <div class="vleft">边缘吸附：</div>
          <div class="vright">
            <n-switch size="medium"
              v-model:value="isEdgeAdsorption"
              @update:value="changeSwitch"
              style="font-size:12px;" >
              <template #checked>开启</template>
              <template #unchecked>关闭</template>
            </n-switch>
          </div>
        </div>

        <div class="card">
          <div class="vleft">页面缩放：</div>
          <div class="vright">
            <n-switch size="medium"
                      v-model:value="isOpenZoom"
                      @update:value="changeZoom" style="font-size:12px;" >
              <template #checked>开启</template>
              <template #unchecked>关闭</template>
            </n-switch>
          </div>
        </div>

        <div class="card">
          <div class="vleft">内存优化：</div>
          <div class="vright">
            <n-switch size="medium"
                      v-model:value="isMemoryOptimizationEnabled"
                      @update:value="changeOptimize" style="font-size:12px;" >
              <template #checked>开启</template>
              <template #unchecked>关闭</template>
            </n-switch>
          </div>
        </div>

        <div class="card">
          <div class="vleft">右键菜单：</div>
          <div class="vright">
            <n-switch size="medium"
                      v-model:value="isOpenContextMenu"
                      @update:value="changeContextMenu" style="font-size:12px;" >
              <template #checked>显示</template>
              <template #unchecked>关闭</template>
            </n-switch>
          </div>
        </div>

        <div class="card">
          <div class="vleft">显示边栏：</div>
          <div class="vright">
            <n-switch size="medium"
                      v-model:value="isMenuVisible"
                      @update:value="changeMenuVisible" style="font-size:12px;" >
              <template #checked>显示</template>
              <template #unchecked>隐藏</template>
            </n-switch>
          </div>
        </div>

        <div class="card">
          <div class="vleft">边栏位置：</div>
          <div class="vright">
            <n-radio-group size="small"
                 @change="changeMenuPos"
                 v-model:value="leftMenuPosition" name="menuPoss" style="font-size: 12px;">
              <n-radio-button
                  v-for="item in leftMenu"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
              />
            </n-radio-group>
          </div>
        </div>

        <div class="card">
          <div class="vleft">外部链接：</div>
          <div class="vright">
            <n-radio-group size="small"
                 @change="changeLinkOpenMethod"
                 v-model:value="howLinkOpenMethod" name="openLink" style="font-size: 12px;">
              <n-radio-button
                  v-for="item in linkOpenMethod"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
              />
            </n-radio-group>
          </div>
        </div>

        <div class="card">
          <div class="vleft">系统主题：</div>
          <div class="vright">
            <n-radio-group size="small"
             @change="changeTheme"
             v-model:value="systemTheme" name="themegroup1" style="font-size: 12px;">
              <n-radio-button
                  v-for="item in themes"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
              />
            </n-radio-group>
          </div>
        </div>

      </div>
    </n-card>

    <n-alert :show-icon="false" type="info" style="margin-bottom: 1rem; margin-top: 20px;">
      <n-h3 style="margin-bottom: 0;">地址管理</n-h3>
    </n-alert>

    <n-card embedded :bordered="true" style="margin-top:1rem;">
      <div class="wrap">
        <div class="card url-input-card">
          <div class="vleft">添加地址：</div>
          <div class="vright url-input-group">
            <n-input size="small"
                     v-model:value="newUrl"
                     placeholder="输入 http:// 或 https:// 开头的地址"
                     style="flex: 1;" />
            <n-button size="small" type="primary" @click="addUrl" style="margin-left: 10px;">添加</n-button>
          </div>
        </div>

        <div class="card url-list-card" v-if="getUrlList.length > 0">
          <div class="vleft">已配置地址：</div>
          <div class="vright url-list">
            <div class="url-item" v-for="(url, index) in getUrlList" :key="index">
              <span class="url-text">{{ url }}</span>
              <n-button size="tiny" type="error" text @click="removeUrl(url)">删除</n-button>
            </div>
          </div>
        </div>

        <div class="card" v-if="getUrlList.length > 0">
          <div class="vleft"></div>
          <div class="vright">
            <n-button type="success" @click="saveUrls">保存地址配置</n-button>
          </div>
        </div>
      </div>
    </n-card>

    <n-card embedded :bordered="true" style="margin-top: 20px;">
      <n-button :loading="btnLoading" @click="handleBtnClick">{{btnText}}</n-button>
    </n-card>

    <n-card embedded :bordered="true" style="margin-top: 20px;">
      <span style="padding-right: 20px;">
        当前版本: <n-tag :bordered="false" type="info" size="medium">{{version.version}}</n-tag>
      </span>
      <span style="padding-right: 20px;">
          最新版本: <n-tag :bordered="false" type="info" size="medium">{{version.newVersion}}</n-tag>
      </span>
      <span>
          获取新版：
        <n-tag :bordered="false" type="info" size="medium" style="margin-right: 20px;">
          <a target="_blank" :href="version.github">GitHub下载</a>
        </n-tag>
        <n-tag :bordered="false" type="error" size="medium">
          <a target="_blank" :href="version.download">国内下载</a>
        </n-tag>
      </span>
      <span style="padding-left: 20px;">
          <n-tag :bordered="false" @click="handleSponsorClick" type="info" size="medium">赞助作者</n-tag>
      </span>
    </n-card>

    <n-drawer :show="isShow" v-model:show="isShow" :width="402" placement="right">
      <n-drawer-content title="支持作者" closable>

.url-input-group {
  display: flex;
  align-items: center;
}

.url-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.url-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  word-break: break-all;
}

.url-text {
  flex: 1;
  font-size: 12px;
  color: #666;
}

.url-list-card .vleft {
  align-self: flex-start;
  margin-top: 5px;
}
        <n-alert :show-icon="false">
          <div class="flex-box">
          <p style="color:#666; padding: 30px;">
            如果本软件对您有帮助，请赞助作者<br>
            如有定制功能的需求，欢迎咨询...
          </p>
          <img class="pay" src="https://upsort.com/pay/weixin.png"  alt="微信支付"/>
          <br />
          <img class="pay" src="https://upsort.com/pay/zhifubao.png"  alt="微信支付"/>
        </div>
        </n-alert>
        <template #footer>
          <div class="flex-footer"></div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped>
.card{
  display: flex;
  margin-bottom: 10px;
  min-width: 0;
  gap: 20px;
}
.pay{
  width: 300px;
  padding: 20px;
}
.flex-box{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>