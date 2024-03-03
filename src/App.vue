<template>
  <el-container>
    <el-aside>
      <el-menu
        class="layout-menu"
        :default-active="$route.path">
        <el-menu-item index="/" @click="routerLink('/')">
          <i class="menu-icon my-icon my-icon-compress"></i>
          <span>{{$t('common.videoCompress')}}</span>
        </el-menu-item>
        <el-menu-item index="/video-cut" @click="routerLink('/video-cut')">
          <i class="menu-icon my-icon my-icon-cut"></i>
          <span>{{$t('common.videoCut')}}</span>
        </el-menu-item>
        <el-menu-item index="/video-merge" @click="routerLink('/video-merge')">
          <i class="menu-icon my-icon my-icon-merge"></i>
          <span>{{$t('common.videoMerge')}}</span>
        </el-menu-item>
        <el-menu-item index="/video-format-conversion" @click="routerLink('/video-format-conversion')">
          <i class="menu-icon my-icon my-icon-convert"></i>
          <span>{{$t('common.videoFormatConversion')}}</span>
        </el-menu-item>
        <el-menu-item index="/video-add-watermark" @click="routerLink('/video-add-watermark')">
          <i class="menu-icon my-icon my-icon-mark"></i>
          <span>{{$t('common.videoAddWatermark')}}</span>
        </el-menu-item>
        <!-- <el-menu-item index="/video-add-dubbing" @click="routerLink('/video-add-dubbing')">
          <i class="menu-icon my-icon my-icon-audio"></i>
          <span>{{$t('common.videoAddDubbing')}}</span>
        </el-menu-item> -->
        <!-- <el-menu-item index="/video-add-subtitles" @click="routerLink('/video-add-subtitles')">
          <i class="menu-icon my-icon my-icon-zimu"></i>
          <span>{{$t('common.videoAddSubtitles')}}</span>
        </el-menu-item> -->
        <!-- <el-menu-item index="/video-create-gif" @click="routerLink('/video-create-gif')">
          <i class="menu-icon my-icon my-icon-gif"></i>
          <span>{{$t('common.videoCreateGif')}}</span>
        </el-menu-item> -->
      </el-menu>

      <div class="footer">
        <div class="item" @click="languageDialogVisible=true;">
          <i class="my-icon my-icon-language"></i>
          <span>{{$t('common.language')}}</span>
        </div>
        <div class="item" @click="openBrowser('https://toollist.net/video-process-desktop-app')">
          <i class="my-icon my-icon-tech-support"></i>
          <span>{{$t('common.support')}}</span>
        </div>
        <div class="item" @click="openBrowser('https://toollist.net/Donata?from=VideoProcessingAssistant')">
          <i class="my-icon my-icon-donata"></i>
          <span>{{$t('common.donata')}}</span>
        </div>
      </div>
    </el-aside>

    <el-main>
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </router-view>
    </el-main>

    <el-dialog :title="$t('common.language')"
      v-model="languageDialogVisible"
      width="600px">
      <el-row class="lang-list">
        <template v-for="(item,key) in languageList" :key="key">
          <el-col :xs="12" :sm="8" :lg="6" class="lang-item" :class="{'active':key==locale}">
            <div :data-lang-code="key" v-on:click="chooseLanguage">{{item}}</div>
          </el-col>
        </template>
      </el-row>
    </el-dialog>
  </el-container>
</template>

<script>
  import { defineComponent, ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from "vue-i18n"
  import common from './utils/common';

  export default defineComponent({
    name: 'App',
    setup() {
      const { t } = useI18n()
      document.title = t("common.title");
      
      const router = useRouter();
      const routerLink = (path) => {
        router.push(path);
      };

      const languageList = reactive(
        {'bg':'Български','cs':'Čeština','da':'Dansk','de':'Deutsch','el':'Ελληνικά','en':'English','es':'Español','et':'Eesti','fi':'Suomi','fr':'Français','hu':'Magyar','it':'Italiano','ja':'日本語','ko':'조선말','nl':'Nederlands','pl':'Polski','pt':'Português','ro':'Română','ru':'Русский','sl':'Slovenščina','sv':'Svenska','th':'ภาษาไทย','vi':'Tiếng Việt','zh':'简体中文','zh-tw':'繁體中文'}
      );
      let locale = ref(localStorage.getItem('locale'));
      let languageDialogVisible = ref(false);
      const i18n = useI18n();
      const chooseLanguage = (e) =>{
        var langCode = e.currentTarget.dataset.langCode;
        i18n.locale.value = langCode;
        locale.value = langCode;
        languageDialogVisible.value = false;
        document.title = t("common.title");
        localStorage.setItem('locale',langCode);
      }

      const openBrowser = (url) =>{
        common.openBrowser(url);
      };
      
      return {
        routerLink,

        languageList,
        locale,
        languageDialogVisible,
        chooseLanguage,

        openBrowser
      }
    }
  })
</script>

<style lang="scss" scoped>
  .el-container{height: 100vh;}
  .el-aside{
    background-color: var(--system-menu-background);width: 230px;display: flex;flex-direction: column;

    .layout-menu {
      flex:1;width: 100%;border: none;background-color: unset;overflow-y:auto;padding-top:10px;
      &.collapse {
        margin-left: 0px;
      }
      :deep() {
        .menu-icon{
          padding-right: 8px;font-size: 20px;
        }
        .el-menu-item, .el-sub-menu {
          background-color: var(--system-menu-background) !important;
        }
        .el-menu-item i, .el-menu-item-group__title, .el-sub-menu__title i {
          color: var(--system-menu-text-color);
        }
        .el-menu-item span, .el-sub-menu__title span{ white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
        .el-menu-item, .el-sub-menu__title{
          &.is-active {
            background-color: var(--system-menu-active-background) !important;
            color: var(--system-menu-active-text-color) !important;
            i {
              color: var(--system-menu-active-text-color) !important;
            }
            &:hover {
              background-color: var(--system-menu-active-background) !important;
              color: var(--system-menu-active-text-color) !important;
            }
          }
          &:hover {
            background-color: var(--system-menu-hover-background) !important;
          }
        }
        .el-sub-menu {
          .el-menu-item {
            text-align: left;width:100%;overflow: hidden;
            &.is-active {
              background-color: var(--system-menu-active-background) !important;
              color: var(--system-menu-active-text-color) !important;
              &:hover {
                background-color: var(--system-menu-active-background) !important;
                color: var(--system-menu-active-text-color) !important;
              }
            }
            &:hover {
              background-color: var(--system-menu-hover-background) !important;
            }
          }
          .el-sub-menu {
            .el-sub-menu__title {
              background-color: var(--system-menu-children-background) !important;
              &:hover {
                background-color: var(--system-menu-hover-background) !important;
              }
            }
          }
        }
      }
    }

    .footer{
      border-top:1px solid #D0D0D0;
      margin-top:5px;
      padding: 5px 0;

      .item{
        display: flex;align-items: center;line-height:40px;cursor: pointer;padding:0 15px;
        i{width:24px;font-size:16px;}
        span{white-space: nowrap; text-overflow: ellipsis; overflow: hidden;}
      }
      .item:hover{color:var(--el-color-primary);}
    }
  }
  .el-main{padding:0;height:100vh;overflow-x: auto;overflow-y: hidden;}

  .lang-list {
    background-color: #fff; 
    .lang-item { 
      text-align: center; line-height: 36px; cursor: pointer;
      &:hover,&.active{color:var(--el-color-primary)}
    }
  }
</style>
