<template>
    <div class="my-container">
        <div class="left">
            <template v-if="(fileData==null || fileData.length==0) && !tableLoading">
                <div class="add-file-cover">
                    <i class="my-icon my-icon-add-video" @click="dialogOpenFile"></i>
                    <div class="tip">{{$t('videoAddWatermark.tip')}}<br/>{{$t('common.addFileTip')}}{{videoExtArr.join(', ')}}</div>
                    <div class="add-filt-btn-box">
                        <el-button type="primary" size="large" class="add-file-btn" plain @click="dialogOpenFile">
                            <i class="my-icon my-icon-file"></i>
                            <span>{{$t('common.addVideoBtn')}}</span>
                        </el-button>
                        <el-tooltip :content="$t('common.addDirTip')" placement="top">
                            <el-button type="primary" size="large" class="add-file-btn" plain @click="dialogOpenDirectory('input')">
                                <i class="my-icon my-icon-folder"></i>
                                <span>{{$t('common.addDirBtn')}}</span>
                            </el-button>
                        </el-tooltip>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="table-top">
                    <el-button type="primary" size="small" @click="dialogOpenFile" :disabled="processIng">
                        <i class="my-icon my-icon-file"></i>
                        <span>{{$t('common.addVideoBtn')}}</span>
                    </el-button>
                    <el-tooltip :content="$t('common.addDirTip')" placement="top">
                        <el-button type="primary" size="small" @click="dialogOpenDirectory('input')" :disabled="processIng">
                            <i class="my-icon my-icon-folder"></i>
                            <span>{{$t('common.addDirBtn')}}</span>
                        </el-button>
                    </el-tooltip>
                    <el-button type="danger" size="small" @click="fileData=[]" :disabled="processIng">
                        <i class="my-icon my-icon-delete"></i>
                        <span>{{$t('common.clearFile')}}</span>
                    </el-button>
                </div>
                <el-table
                    v-loading="tableLoading"
                    :data="filePageData"
                    size="small"
                    border
                    style="width: 100%;"
                    :header-cell-style="{backgroundColor:'#f5f7fa',color:'#606266'}">
                    <el-table-column prop="sourcePath" :label="$t('common.sourcePath')" min-width="150px">
                        <template #default="scope">
                            <div @click="openPath(scope.row.sourcePath)" style="cursor: pointer;">{{scope.row.sourcePath}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceSize" :label="$t('common.sourceSize')" min-width="80px" align="right">
                        <template #default="scope">
                            {{scope.row.sourceSize!=null?(scope.row.sourceSize/1024/1024).toFixed(2)+"MB":""}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.sourceResolution')" min-width="90px" show-overflow-tooltip align="right">
                        <template #default="scope"> 
                            {{scope.row.sourceWidth!=null && scope.row.sourceHeight!=null?scope.row.sourceWidth+"x"+scope.row.sourceHeight:""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="newPath" :label="$t('common.newPath')" min-width="150px">
                        <template #default="scope">
                            <div @click="openPath(scope.row.newPath)" style="cursor: pointer;">{{scope.row.newPath}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="newSize" :label="$t('common.newSize')" min-width="80px" align="right">
                        <template #default="scope">
                            {{scope.row.newSize!=null?(scope.row.newSize/1024/1024).toFixed(2)+"MB":""}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('common.newResolution')" min-width="90px" show-overflow-tooltip align="right">
                        <template #default="scope"> 
                            {{scope.row.newWidth!=null && scope.row.newHeight!=null?scope.row.newWidth+"x"+scope.row.newHeight:""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" :label="$t('common.status')" width="100px" fixed="right">
                        <template #default="scope">
                            <el-progress v-if="scope.row.status==1" class="progress" :text-inside="true" :stroke-width="20" :percentage="scope.row.processPercent" text-color="#fff"></el-progress>
                            <span v-else v-html="showProcessStatus(scope.row.status)"></span>
                        </template>
                    </el-table-column>
                    <el-table-column width="40px" fixed="right">
                        <template #default="scope">
                            <div class="operate">
                                <i class="my-icon my-icon-cuo" :class="{'disabled': processIng}" @click="delFileData(scope)"></i>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="table-data-page">
                    <el-pagination
                        background
                        layout="total, prev, pager, next"
                        :pager-count="5"
                        small
                        :total="fileData.length"
                        :page-size="pageSize"
                        :current-page="pageIndex"
                        @current-change="pageIndexChange">
                    </el-pagination>
                </div>
            </template>
        </div>

        <div class="setting">
            <div class="title">{{$t('videoAddWatermark.processSetting')}}</div>
            <el-form :model="processOptions" :rules="processOptionsRules" ref="processOptionsForm" label-position="top" size="small">
                <el-form-item>
                    <template #label>
                        <el-tooltip :content="$t('common.taskThreadsNumberTip')" placement="top">
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{$t('common.taskThreadsNumber')}}
                    </template>
                    <el-slider class="content slider" v-model="processOptions.taskThreadsNumber" :disabled="processIng" :min="1" :max="5"></el-slider>
                </el-form-item>

                <el-form-item :label="$t('videoAddWatermark.watermarkType')">
                    <el-radio-group v-model="processOptions.watermarkType" size="small" :disabled="processIng">
                        <el-radio label="image">{{$t('videoAddWatermark.image')}}</el-radio>
                        <el-radio label="text">{{$t('videoAddWatermark.text')}}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <template v-if="processOptions.watermarkType=='image'">
                    <el-form-item :label="$t('videoAddWatermark.imagePath')" prop="imagePath" :rules="{required: true, message: $t('videoAddWatermark.imagePathTip'), trigger: 'change'}">
                        <el-input class="content" v-model="processOptions.imagePath" :disabled="processIng" clearable>
                            <template #append>
                                <i class="open-folder my-icon my-icon-tupian" @click="dialogOpenFile('watermarkImgPath')"></i>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item :label="$t('videoAddWatermark.position')">
                        <el-select class="content" v-model="processOptions.imagePosition" :disabled="processIng">
                            <el-option :label="$t('videoAddWatermark.positionCustom')" key="custom" value="custom"></el-option>
                            <el-option :label="$t('videoAddWatermark.positionLt')" key="lt" value="lt"></el-option>
                            <el-option :label="$t('videoAddWatermark.positionMt')" key="mt" value="mt"></el-option>
                            <el-option :label="$t('videoAddWatermark.positionRt')" key="rt" value="rt"></el-option>
                            <el-option :label="$t('videoAddWatermark.positionLm')" key="lm" value="lm"></el-option>
                            <el-option :label="$t('videoAddWatermark.positionM')" key="m" value="m"></el-option>
                            <el-option :label="$t('videoAddWatermark.positionRm')" key="rm" value="rm"></el-option>
                            <el-option :label="$t('videoAddWatermark.positionLb')" key="lb" value="lb"></el-option>
                            <el-option :label="$t('videoAddWatermark.positionMb')" key="mb" value="mb"></el-option>
                            <el-option :label="$t('videoAddWatermark.positionRb')" key="rb" value="rb"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item v-if="processOptions.imagePosition=='custom'" prop="position" :label="$t('videoAddWatermark.customPosition')">
                        <div style="display: flex;">
                            <el-input class="content" v-model="processOptions.positionX" :disabled="processIng" :placeholder="$t('videoAddWatermark.positionX')" clearable></el-input>
                            <span style="padding:0 2px;">~</span>
                            <el-input class="content" v-model="processOptions.positionY" :disabled="processIng" :placeholder="$t('videoAddWatermark.positionY')" clearable></el-input>
                        </div>
                    </el-form-item>
                </template>
                <template v-else>
                    <el-form-item :label="$t('videoAddWatermark.text')" prop="text" :rules="{required: true, message: $t('videoAddWatermark.textTip'), trigger: 'blur'}">
                        <el-input class="content" v-model="processOptions.text" :disabled="processIng" clearable></el-input>
                    </el-form-item>
                    <el-form-item :label="$t('videoAddWatermark.fontSize')">
                        <el-slider class="content slider" v-model="processOptions.fontSize" :disabled="processIng" :min="10" :max="300"></el-slider>
                    </el-form-item>
                    <el-form-item :label="$t('videoAddWatermark.fontColor')">
                        <el-color-picker v-model="processOptions.fontColor" :disabled="processIng" />
                    </el-form-item>
                    <el-form-item :label="$t('videoAddWatermark.fontBgColor')">
                        <el-color-picker v-model="processOptions.fontBgColor" :disabled="processIng" />
                    </el-form-item>
                    <el-form-item prop="position" :label="$t('videoAddWatermark.positionXy')">
                        <div style="display: flex;">
                            <el-input class="content" v-model="processOptions.positionX" :disabled="processIng" placeholder="$t('videoAddWatermark.positionX')" clearable></el-input>
                            <span style="padding:0 2px;">~</span>
                            <el-input class="content" v-model="processOptions.positionY" :disabled="processIng" placeholder="$t('videoAddWatermark.positionY')" clearable></el-input>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <template #label>
                            <el-tooltip :content="$t('videoAddWatermark.opacityTip')" placement="top">
                                <i class="my-icon my-icon-help"></i>
                            </el-tooltip>
                            {{$t('videoAddWatermark.opacity')}}
                        </template>
                        <el-slider class="content slider" v-model="processOptions.opacity" :disabled="processIng" :step="0.01" :min="0.05" :max="1"></el-slider>
                    </el-form-item>
                </template>
                <el-form-item :label="$t('common.videoResolution')">
                    <el-select class="content" v-model="processOptions.resolution" :disabled="processIng" :placeholder="$t('common.selectTip')">
                        <el-option v-for="(item,key) in resolutionArr" :key="key" :label="item" :value="key"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="processOptions.resolution=='custom' || processOptions.resolution=='customMax'" prop="customResolution">
                    <template #label>
                        <el-tooltip placement="top">
                            <template #content>
                                <div v-if="processOptions.resolution=='custom'" style="line-height: 24px;">{{$t('common.customResolutionTip1')}}<br/>{{$t('common.customResolutionTip2')}}</div>
                                <div v-if="processOptions.resolution=='customMax'" style="line-height: 24px;">{{$t('common.customResolutionTip1')}}<br/>{{$t('common.customResolutionTip2')}}<br/>{{$t('common.customResolutionTip3')}}<br/>{{$t('common.customResolutionTip4')}}</div>
                            </template>
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{processOptions.resolution=='custom' ? $t('common.customResolution') : $t('common.customMaxResolution')}}
                    </template>
                    <div style="display: flex;">
                        <el-input class="content" 
                            v-model="processOptions.customVideoWidth" 
                            :disabled="processIng" 
                            :placeholder="processOptions.resolution=='custom' ? $t('common.width') : $t('common.maxWidth')" 
                            clearable>
                        </el-input>
                        <span style="padding:0 3px;">x</span>
                        <el-input class="content" 
                            v-model="processOptions.customVideoHeight" 
                            :disabled="processIng" 
                            :placeholder="processOptions.resolution=='custom' ? $t('common.height') : $t('common.maxHeight')" 
                            clearable>
                        </el-input>
                    </div>
                </el-form-item>
                <el-form-item :label="$t('common.outDir')" prop="outputPath" :rules="{required: true, message: $t('common.selectOutputDirTip'), trigger: 'change'}">
                    <el-input class="content" v-model="processOptions.outputPath" :disabled="processIng" clearable>
                        <template #append>
                            <i class="open-folder my-icon my-icon-folder" @click="dialogOpenDirectory('output')"></i>
                        </template>
                    </el-input>
                </el-form-item>
                <el-button type="primary" plain class="content" :disabled="processIng || fileData==null || fileData.length==0" @click="goPreviewVideoWatermark">{{$t('videoAddWatermark.previewWatermark')}}</el-button>
            </el-form>
            <div class="bottom">
                <el-button type="primary" size="large" class="btn-process" @click="goProcess" 
                    :disabled="fileData==null || fileData.length==0 || fileProcessPercent==100">
                    {{processIng?$t('videoAddWatermark.processStop'):$t('videoAddWatermark.processStart')}}
                </el-button>
            </div>
        </div>
        
        <el-dialog :title="$t('videoAddWatermark.previewDialogTitle')"
            v-model="previewDialogVisible"
            width="600px">
            <el-form label-width="100px">
                <el-form-item :label="$t('videoAddWatermark.videoSelect')">
                    <el-select class="w100" v-model="previewPath">
                        <el-option v-for="item in fileData.slice(0,100)" :key="item.id" :label="item.sourcePath" :value="item.sourcePath"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="previewVideoWatermark">{{$t('videoAddWatermark.preview')}}</el-button>
                    <el-button @click="previewDialogVisible=false">{{$t('common.cancel')}}</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>
  
<script>
    import { ElLoading } from 'element-plus'
    import common from '../utils/common';
    import { toRaw } from '@vue/reactivity'
    export default {
        name: 'VideoAddWatermark',
        data() {
            var checkPosition = (rule, value, callback) => {
                if(this.isNullOrEmpty(this.processOptions.positionX) || this.isNullOrEmpty(this.processOptions.positionY)){
                    callback(new Error(this.$t('videoAddWatermark.checkPositionTip')));
                } else if(isNaN(this.processOptions.positionX) || !/^[0-9]+$/.test(this.processOptions.positionX)){
                    callback(new Error(this.$t('common.mustBeInt')));
                } else if(isNaN(this.processOptions.positionY) || !/^[0-9]+$/.test(this.processOptions.positionY)){
                    callback(new Error(this.$t('common.mustBeInt')));
                } else {
                    callback();
                }
            };
            var checkCustomResolution = (rule, value, callback) => {
                if (this.processOptions.customVideoWidth!=null && this.processOptions.customVideoWidth!=''){
                    if(isNaN(this.processOptions.customVideoWidth) || !/^[0-9]+$/.test(this.processOptions.customVideoWidth)){
                        callback(new Error(this.$t('common.mustBeInt')));
                    }
                }
                if (this.processOptions.customVideoHeight!=null && this.processOptions.customVideoHeight!=''){
                    if(isNaN(this.processOptions.customVideoHeight) || !/^[0-9]+$/.test(this.processOptions.customVideoHeight)){
                        callback(new Error(this.$t('common.mustBeInt')));
                    }
                }
                callback();
            };

            return {
                videoExtArr:['mp4','mov','avi','mkv','ts','flv','swf','mpeg','mpg','m4v','vob','wmv'],

                fileData:[],
                tableLoading:false,
                pageIndex: 1,
                pageSize: 100,

                processIng:false,

                processOptions:{
                    taskThreadsNumber:2,
                    watermarkType:'image',
                    imagePath:'',
                    imagePosition:'rt',
                    text:'',
                    fontSize:50,
                    fontColor:'#24a500',
                    fontBgColor:'',
                    opacity:1,
                    positionX:10,
                    positionY:10,
                    resolution:'source',
                    customVideoWidth:null,
                    customVideoHeight:null,
                    outputPath:'',
                    videoTempDirPath:'',
                },
                processOptionsRules: {
                    position: [
                        { required: true, validator: checkPosition, trigger: 'blur'}
                    ],
                    customResolution: [
                        { validator: checkCustomResolution, trigger: 'blur' }
                    ]
                },
                
                previewDialogVisible:false,
                previewPath:null
            }
        },
        computed:{
            filePageData(){
                return this.fileData.slice((this.pageIndex-1)*this.pageSize,this.pageIndex*this.pageSize);
            },

            fileProcessPercent(){
                if(this.fileData.length==0)
                    return 0;
                var filterData = this.fileData.filter(item => {
                    return item.status == 2 || item.status == 3
                });
                
                return parseInt((filterData.length/this.fileData.length)*100,10);
            },

            resolutionArr(){
                return {
                    "source":this.$t('common.useSourceResolution'),
                    "custom":this.$t('common.customResolution'),
                    "customMax":this.$t('common.customMaxResolution'),
                    "320x240":"320x240",
                    "480x320":"480x320",
                    "640x480":"640x480",
                    "720x404":"720x404(480P 16:9)",
                    "720x480":"720x480(480P)",
                    "720x567":"720x567",
                    "1024x576":"1024x576(16:9)",
                    "576x1024":"570x1024(9:16)",
                    "1280x720":"1280x720(720P)",
                    "720x1280":"720x1280(720P)",
                    "1920x1080":"1920x1080(1080P)",
                    "1080x1920":"1080x1920(1080P)",
                    "2560x1440":"2560x1440(2K)",
                    "1440x2560":"1440x2560(2K)",
                    "3840x2160":"3840x2160(4K)",
                    "2160x3840":"2160x3840(4K)"
                };
            }
        },
        methods: {
            toNum(str){
                if(this.isNullOrEmpty(str) || isNaN(str))
                    return null;
                else
                    return Number(str);
            },

            dialogOpenFile(type){
                if(type=='watermarkImgPath'){
                    common.dialogOpenFile(['jpg','jpeg','png','gif','bmp'],false)
                    .then(filePaths=>{
                        if(filePaths!=null && filePaths.length>0){
                            this.processOptions.imagePath=filePaths[0];
                        }
                    });
                }else{
                    common.dialogOpenFile(toRaw(this.videoExtArr))
                    .then(filePaths=>{
                        if(filePaths!=null && filePaths.length>0){
                            this.tableLoading=true;
                            setTimeout(()=>{
                                for(var i=0;i<filePaths.length;i++){
                                    var filterData = this.fileData.filter(item => {
                                        return item.sourcePath == filePaths[i]
                                    });
                                    if(filterData.length>0){
                                        continue;
                                    }
                                    this.fileData.push({
                                        sourcePath:filePaths[i],
                                        sourceSize:null,
                                        sourceDuration:null,
                                        sourceWidth:null,
                                        sourceHeight:null,
                                        newPath:null,
                                        newSize:null,
                                        newWidth:null,
                                        newHeight:null,
                                        status:0,
                                        processPercent:0
                                    });
                                }
                                this.tableLoading=false;
                                this.setMediaMetaData();
                            },100);
                        }
                    });
                }
            },

            dialogOpenDirectory(dirType){
                common.dialogOpenDirectory()
                .then(dirPaths=>{
                    if(dirPaths==null || dirPaths=='')
                        return;
                    if(dirType=="output"){
                        this.processOptions.outputPath = dirPaths
                    }else if(dirType=="input"){
                        var fileData = common.getFilesFromDir(dirPaths,toRaw(this.videoExtArr));
                        if(fileData!=null && fileData.length>0){
                            this.tableLoading=true;
                            setTimeout(()=>{
                                for(var i=0;i<fileData.length;i++){
                                    var filterData = this.fileData.filter(item => {
                                        return item.sourcePath == fileData[i].filePath
                                    });
                                    if(filterData.length>0){
                                        continue;
                                    }
            
                                    this.fileData.push({
                                        sourcePath:fileData[i].filePath,
                                        sourceSize:null,
                                        sourceDuration:null,
                                        sourceWidth:null,
                                        sourceHeight:null,
                                        newPath:null,
                                        newSize:null,
                                        newWidth:null,
                                        newHeight:null,
                                        status:0,
                                        processPercent:0
                                    });
                                }
                                this.tableLoading=false;
                                this.setMediaMetaData();
                            },100);
                        }
                    }
                });
            },

            //异步获取媒体参数，防止页面卡顿
            setMediaMetaData(){
                var filterData = this.fileData.filter(item => {
                    return item.sourceSize == null
                });
                function* gengeratorFun() {
                    for (var i=0;i<filterData.length;i++) {
                        yield getMediaMetaData(filterData[i].sourcePath);
                    }
                }
                
                var getMediaMetaData = (filePath)=>{
                    var curData = this.fileData.filter(item => {
                        return item.sourcePath == filePath
                    });
                    if(curData.length==0){
                        console.log('empty');
                        var emptyData = this.fileData.filter(item => {
                            return item.sourceSize == null
                        });
                        if(emptyData.length>0){
                            setTimeout(() => {
                                gf.next();
                            }, 30);
                        }
                    }else{
                        common.getMediaMetaData(filePath,(metaData)=>{
                            try{
                                curData[0].sourceSize=metaData.format.size;
                                curData[0].sourceDuration=metaData.format.duration;
                                for(var k=0;k<metaData.streams.length;k++){
                                    if(metaData.streams[k].codec_type=='video'){
                                        curData[0].sourceWidth=metaData.streams[k].width;
                                        curData[0].sourceHeight=metaData.streams[k].height;
                                        break;
                                    }
                                }
                            }catch(e){
                                console.log(e);
                            }
                            gf.next();
                        });
                    }
                }

                var gf = gengeratorFun();
                gf.next();
            },

            showProcessStatus(status){
                if(status==0){
                    return this.$t('videoAddWatermark.unProcess');
                }else if(status==1){
                    return "<span style='color:var(--el-color-primary-dark-2)'>"+this.$t('videoAddWatermark.processIng')+"</span>";
                }else if(status==2){
                    return "<span style='color:var(--el-color-primary)'>"+this.$t('videoAddWatermark.processSuccess')+"</span>";
                }else if(status==3){
                    return "<span style='color:var(--el-color-danger)'>"+this.$t('videoAddWatermark.processFail')+"</span>";
                }
            },

            pageIndexChange(e) {
                this.pageIndex = e;
            },

            delFileData(scope){
                if(this.processIng){
                    return;
                }
                var rowIndex=(this.pageIndex-1)*this.pageSize+scope.$index;
                this.fileData.splice(rowIndex,1);
            },

            renameForNewFile(filePath){
                if(common.fileExists(filePath)){
                    return this.renameForNewFile(filePath.replace(".","(1)."));
                }
                return filePath;
            },

            goPreviewVideoWatermark(){
                if(this.processOptions.watermarkType=='image'){
                    if(this.isNullOrEmpty(this.processOptions.imagePath)){
                        this.$message.error(this.$t('videoAddWatermark.watermarkTip1'));
                        return;
                    }
                }else{
                    if(this.isNullOrEmpty(this.processOptions.text)){
                        this.$message.error(this.$t('videoAddWatermark.watermarkTip2'));
                        return;
                    }
                }

                if((this.processOptions.watermarkType=='image' && this.processOptions.imagePosition=='custom') || this.processOptions.watermarkType=='text'){
                    if(this.isNullOrEmpty(this.processOptions.positionX) || this.isNullOrEmpty(this.processOptions.positionY)){
                        this.$message.error(this.$t('videoAddWatermark.checkPositionTip'));
                        return;
                    } else if(isNaN(this.processOptions.positionX) || !/^[0-9]+$/.test(this.processOptions.positionX)){
                        this.$message.error(this.$t('videoAddWatermark.checkPositionTip2'));
                        return;
                    } else if(isNaN(this.processOptions.positionY ) || !/^[0-9]+$/.test(this.processOptions.positionY)){
                        this.$message.error(this.$t('videoAddWatermark.checkPositionTip2'));
                        return;
                    }
                }

                if(this.processOptions.resolution=='custom' || this.processOptions.resolution=='customMax'){
                    if (this.processOptions.customVideoWidth!=null && this.processOptions.customVideoWidth!=''){
                        if(isNaN(this.processOptions.customVideoWidth) || !/^[0-9]+$/.test(this.processOptions.customVideoWidth)){
                            this.$message.error(this.$t('videoAddWatermark.customResolutionTip'));
                            return;
                        }
                    }
                    if (this.processOptions.customVideoHeight!=null && this.processOptions.customVideoHeight!=''){
                        if(isNaN(this.processOptions.customVideoHeight) || !/^[0-9]+$/.test(this.processOptions.customVideoHeight)){
                            this.$message.error(this.$t('videoAddWatermark.customResolutionTip'));
                            return;
                        }
                    }
                }

                this.previewPath=this.fileData[0].sourcePath;
                if(this.fileData.length==1){
                    this.previewVideoWatermark();
                }else{
                    this.previewDialogVisible=true;
                }
            },
            previewVideoWatermark(){
                var filterData = this.fileData.filter(item => {
                    return item.sourcePath == this.previewPath
                });
                this.processOptions.duration=Number(filterData[0].duration);
                this.processOptions.videoWidth=Number(filterData[0].sourceWidth);
                this.processOptions.videoHeight=Number(filterData[0].sourceHeight);
                
                var loading = ElLoading.service({
                    lock: true,
                    text:  this.processOptions.watermarkType=='image' ? this.$t('videoAddWatermark.previewLoadingTip') : '',
                    target: "body"
                });
                if(this.processOptions.watermarkType=='text'){
                    setTimeout(() => {
                        loading.close();
                    }, 700)
                }
                common.previewVideoWatermark(this.previewPath,this.processOptions,(progress)=>{
                },()=>{
                    setTimeout(() => {
                        loading.close();
                    }, 700)
                },(e)=>{
                    this.$message.error(this.$t('common.systemError'));
                    loading.close();
                });

            },

            killVideoAddWatermarkCommand(){
                common.killVideoAddWatermarkCommand();
                this.processIng=false;
                var filterData = this.fileData.filter(item => {
                    return item.status == 1
                });
                for(var i=0;i<filterData.length;i++){
                    filterData[i].status=0;
                    filterData[i].processPercent=0;
                }

                setTimeout(() => {
                    for(var i=0;i<filterData.length;i++){
                        if(!this.isNullOrEmpty(filterData[i].newTmpPath)){
                            common.deleteFile(filterData[i].newTmpPath);
                            filterData[i].newTmpPath=null;
                        }
                    }
                    common.deleteDir(this.processOptions.videoTempDirPath);
                }, 1000);
            },

            goProcess(){
                if(this.fileProcessPercent==100)
                    return;
                if(this.processIng){
                    this.killVideoAddWatermarkCommand();
                    return;
                }
                
                this.$refs['processOptionsForm'].validate((valid) => {
                    if (valid) {
                        this.processIng=true;
                        this.processStart();
                    }else{
                        this.$message.error(this.$t('videoAddWatermark.settingDataValiErrTip'));
                    }
                });
            },

            processStart(){
                var outputPath=this.processOptions.outputPath.replace(/\\/g,"/");
                if(outputPath.length==outputPath.lastIndexOf("/")+1){
                    outputPath=outputPath.substr(0,outputPath.length-1);
                }

                //临时视频文件路径
                this.processOptions.videoTempDirPath = outputPath+"/VideoTemp";
                common.makeDir(this.processOptions.videoTempDirPath);

                for(var i=0;i<this.fileData.length;i++){
                    if(!this.processIng)
                        return;
                    
                    var filterData = this.fileData.filter(item => {
                        return item.status == 1
                    });
                    if(filterData.length==this.processOptions.taskThreadsNumber){
                        return;
                    }

                    if(this.fileData[i].status!=0){
                        continue;
                    }

                    ((j)=>{
                        //输出文件路径
                        var sourcePath = this.fileData[j].sourcePath.replace(/\\/g,"/");
                        var outputVideoPath=outputPath+sourcePath.substr(sourcePath.lastIndexOf('/'));
                        outputVideoPath=this.renameForNewFile(outputVideoPath);
                        
                        this.fileData[j].status=1;
                        this.fileData[j].newTmpPath=outputVideoPath;
                        this.fileData[j].videoTempName = this.processOptions.videoTempDirPath+'/'+Date.now()+sourcePath.substr(sourcePath.lastIndexOf('.'));

                        common.videoAddWatermark(this.fileData[j].sourcePath, this.fileData[j].videoTempName, outputVideoPath, this.processOptions,(progress)=>{
                            if(!this.isNullOrEmpty(progress.percent) && !isNaN(progress.percent))
                                this.fileData[j].processPercent=Number(progress.percent.toFixed(1));
                        },()=>{
                            common.deleteFile(this.fileData[j].videoTempName);
                            this.fileData[j].status=2;
                            this.fileData[j].newPath=outputVideoPath;
                            this.fileData[j].newTmpPath=null;
                            this.fileData[j].videoTempName=null;
                            this.processStart();
                            this.processOver();
                            common.getMediaMetaData(outputVideoPath,(metaData)=>{
                                this.fileData[j].newSize=metaData.format.size;
                                for(var k=0;k<metaData.streams.length;k++){
                                    if(metaData.streams[k].codec_type=='video'){
                                        this.fileData[j].newWidth=metaData.streams[k].width;
                                        this.fileData[j].newHeight=metaData.streams[k].height;
                                        break;
                                    }
                                }
                                console.log(metaData)
                            });
                        },()=>{
                            if(!this.processIng)
                                return;
                            common.deleteFile(this.fileData[j].newTmpPath);
                            common.deleteFile(this.fileData[j].videoTempName);
                            this.fileData[j].status=3;
                            this.fileData[j].newTmpPath=null;
                            this.fileData[j].videoTempName=null;
                            this.processStart();
                            this.processOver();
                        });
                    })(i);
                }
            },

            processOver(){
                if(this.fileProcessPercent==100){
                    setTimeout(() => {
                        this.$alert(this.$t('videoAddWatermark.processOver'), this.$t('common.tip'), {
                            confirmButtonText: this.$t('common.ok'),
                            callback: action => {
                                this.processIng=false;
                                common.deleteDir(this.processOptions.videoTempDirPath);
                            }
                        });
                    }, 800);
                }
            },

            openPath(url){
                common.openPath(url);
            }
        }
    }
</script>