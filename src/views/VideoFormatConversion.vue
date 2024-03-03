<template>
    <div class="my-container">
        <div class="left">
            <template v-if="(fileData==null || fileData.length==0) && !tableLoading">
                <div class="add-file-cover">
                    <i class="my-icon my-icon-add-video" @click="dialogOpenFile"></i>
                    <div class="tip">{{$t('videoFormatConvert.tip')}}<br/>{{$t('common.addFileTip')}}{{videoExtArr.join(', ')}}</div>
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
                    <el-button type="primary" size="small" @click="dialogOpenFile" :disabled="convertIng">
                        <i class="my-icon my-icon-file"></i>
                        <span>{{$t('common.addVideoBtn')}}</span>
                    </el-button>
                    <el-tooltip :content="$t('common.addDirTip')" placement="top">
                        <el-button type="primary" size="small" @click="dialogOpenDirectory('input')" :disabled="convertIng">
                            <i class="my-icon my-icon-folder"></i>
                            <span>{{$t('common.addDirBtn')}}</span>
                        </el-button>
                    </el-tooltip>
                    <el-button type="danger" size="small" @click="fileData=[]" :disabled="convertIng">
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
                    <el-table-column prop="sourceFormat" :label="$t('videoFormatConvert.sourceFormat')" min-width="80px"></el-table-column>
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
                    <el-table-column prop="newFormat" :label="$t('videoFormatConvert.newFormat')" min-width="100px" fixed="right">
                        <template #default="scope">
                            <el-select class="content" v-model="scope.row.newFormat" :disabled="convertIng" :placeholder="$t('common.selectTip')" size="small">
                                <el-option v-for="item in videoExtArr" :key="item" :label="item" :value="item"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" :label="$t('common.status')" width="100px" fixed="right">
                        <template #default="scope">
                            <el-progress v-if="scope.row.status==1" class="progress" :text-inside="true" :stroke-width="20" :percentage="scope.row.convertPercent" text-color="#fff"></el-progress>
                            <span v-else v-html="showConvertStatus(scope.row.status)"></span>
                        </template>
                    </el-table-column>
                    <el-table-column width="40px" fixed="right">
                        <template #default="scope">
                            <div class="operate">
                                <i class="my-icon my-icon-cuo" :class="{'disabled': convertIng}" @click="delFileData(scope)"></i>
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
            <div class="title">{{$t('videoFormatConvert.convertSetting')}}</div>
            <el-form :model="convertOptions" ref="convertOptionsForm" label-position="top" size="small">
                <el-form-item>
                    <template #label>
                        <el-tooltip :content="$t('common.taskThreadsNumberTip')" placement="top">
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{$t('common.taskThreadsNumber')}}
                    </template>
                    <el-slider class="content slider" v-model="convertOptions.taskThreadsNumber" :disabled="convertIng" :min="1" :max="5"></el-slider>
                </el-form-item>
                <el-form-item :label="$t('videoFormatConvert.batchSetNewFormat')">
                    <el-select class="content" v-model="convertOptions.newFormat" :disabled="convertIng" @change="newFormatChange" :placeholder="$t('common.selectTip')">
                        <el-option v-for="item in videoExtArr" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('common.outDir')" prop="outputPath" :rules="{required: true, message: $t('common.selectOutputDirTip'), trigger: 'change'}">
                    <el-input class="content" v-model="convertOptions.outputPath" :disabled="convertIng" clearable>
                        <template #append>
                            <i class="open-folder my-icon my-icon-folder" @click="dialogOpenDirectory('output')"></i>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
            <div class="bottom">
                <el-button type="primary" size="large" class="btn-process" @click="goConvert" 
                    :disabled="fileData==null || fileData.length==0 || fileConvertPercent==100">
                    {{convertIng?$t('videoFormatConvert.convertStop'):$t('videoFormatConvert.convertStart')}}
                </el-button>
            </div>
        </div>
    </div>
</template>
  
<script>
    import common from '../utils/common';
    import { toRaw } from '@vue/reactivity'
    export default {
        name: 'VideoFormatConversion',
        data() {
            return {
                videoExtArr:['mp4','mov','avi','mkv','ts','flv','swf','mpeg','mpg','m4v','vob','wmv'],

                fileData:[],
                tableLoading:false,
                pageIndex: 1,
                pageSize: 50,

                convertIng:false,

                convertOptions:{
                    taskThreadsNumber:2,
                    newFormat:null,
                    outputPath:''
                }
            }
        },
        computed:{
            filePageData(){
                return this.fileData.slice((this.pageIndex-1)*this.pageSize,this.pageIndex*this.pageSize);
            },

            fileConvertPercent(){
                if(this.fileData.length==0)
                    return 0;
                var filterData = this.fileData.filter(item => {
                    return item.status == 2 || item.status == 3
                });
                
                return parseInt((filterData.length/this.fileData.length)*100,10);
            }
        },
        methods: {
            toNum(str){
                if(this.isNullOrEmpty(str) || isNaN(str))
                    return null;
                else
                    return Number(str);
            },

            dialogOpenFile(){
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
                                    sourceFormat:filePaths[i].substr(filePaths[i].lastIndexOf('.')+1),
                                    newPath:null,
                                    newSize:null,
                                    newFormat:this.convertOptions.newFormat,
                                    status:0,
                                    convertPercent:0
                                });
                            }
                            this.tableLoading=false;
                            this.setMediaMetaData();
                        },100);
                    }
                });
            },

            dialogOpenDirectory(dirType){
                common.dialogOpenDirectory()
                .then(dirPaths=>{
                    if(dirPaths==null || dirPaths=='')
                        return;
                    if(dirType=="output"){
                        this.convertOptions.outputPath = dirPaths
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
                                        sourceSize:fileData[i].fileSize,
                                        sourceFormat:fileData[i].filePath.substr(fileData[i].filePath.lastIndexOf('.')+1),
                                        newPath:null,
                                        newSize:null,
                                        newFormat:this.convertOptions.newFormat,
                                        status:0,
                                        convertPercent:0
                                    });
                                }
                                this.tableLoading=false;
                                //this.setMediaMetaData();
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

            showConvertStatus(status){
                if(status==0){
                    return this.$t('videoFormatConvert.unConvert');
                }else if(status==1){
                    return "<span style='color:var(--el-color-primary-dark-2)'>"+this.$t('videoFormatConvert.convertIng')+"</span>";
                }else if(status==2){
                    return "<span style='color:var(--el-color-primary)'>"+this.$t('videoFormatConvert.convertSuccess')+"</span>";
                }else if(status==3){
                    return "<span style='color:var(--el-color-danger)'>"+this.$t('videoFormatConvert.convertFail')+"</span>";
                }
            },

            pageIndexChange(e) {
                this.pageIndex = e;
            },

            delFileData(scope){
                if(this.convertIng){
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

            newFormatChange(e){
                this.convertOptions.newFormat=e;
                for(var i=0;i<this.fileData.length;i++){
                    this.fileData[i].newFormat=e;
                }
            },

            killVideoFormatConvertCommand(){
                common.killVideoFormatConvertCommand();
                this.convertIng=false;
                var filterData = this.fileData.filter(item => {
                    return item.status == 1
                });
                for(var i=0;i<filterData.length;i++){
                    filterData[i].status=0;
                    filterData[i].convertPercent=0;
                }

                setTimeout(() => {
                    for(var i=0;i<filterData.length;i++){
                        if(!this.isNullOrEmpty(filterData[i].newTmpPath)){
                            common.deleteFile(filterData[i].newTmpPath);
                            filterData[i].newTmpPath=null;
                        }
                    }
                }, 1000);
            },

            goConvert(){
                if(this.fileConvertPercent==100)
                    return;
                if(this.convertIng){
                    this.killVideoFormatConvertCommand();
                    return;
                }

                var newFormatNoSettingData = this.fileData.filter(item => {
                    return item.newFormat == null
                });
                if(newFormatNoSettingData.length>0){
                    this.$message.error(this.$t('videoFormatConvert.newFormatNoSettingTip'));
                    return;
                }
                
                this.$refs['convertOptionsForm'].validate((valid) => {
                    if (valid) {
                        this.convertIng=true;
                        this.convertStart();
                    }
                });
            },

            convertStart(){
                for(var i=0;i<this.fileData.length;i++){
                    if(!this.convertIng)
                        return;
                    
                    var filterData = this.fileData.filter(item => {
                        return item.status == 1
                    });
                    if(filterData.length==this.convertOptions.taskThreadsNumber){
                        return;
                    }

                    if(this.fileData[i].status!=0){
                        continue;
                    }

                    ((j)=>{
                        var outputPath=this.convertOptions.outputPath.replace(/\\/g,"/");
                        if(outputPath.length==outputPath.lastIndexOf("/")+1){
                            outputPath=outputPath.substr(0,outputPath.length-1);
                        }
                        var sourcePath = this.fileData[j].sourcePath.replace(/\\/g,"/");
                        outputPath=outputPath+sourcePath.substr(sourcePath.lastIndexOf('/'));
                        outputPath=outputPath.substr(0,outputPath.lastIndexOf('.')+1)+this.fileData[j].newFormat;
                        outputPath=this.renameForNewFile(outputPath);
        
                        this.fileData[j].status=1;
                        this.fileData[j].newTmpPath=outputPath;

                        common.videoFormatConvert(this.fileData[j].sourcePath, outputPath, null,(progress)=>{
                            if(!this.isNullOrEmpty(progress.percent) && !isNaN(progress.percent))
                                this.fileData[j].convertPercent=Number(progress.percent.toFixed(1));
                        },()=>{
                            this.fileData[j].status=2;
                            this.fileData[j].newPath=outputPath;
                            this.fileData[j].newTmpPath=null;
                            this.convertStart();
                            this.convertOver();
                            common.getMediaMetaData(outputPath,(metaData)=>{
                                this.fileData[j].newSize=metaData.format.size;
                                this.fileData[j].newBitRate=metaData.format.bit_rate;
                                for(var k=0;k<metaData.streams.length;k++){
                                    if(metaData.streams[k].codec_type=='video'){
                                        this.fileData[j].newFrameRate=Number(eval(metaData.streams[k].r_frame_rate).toFixed(0));
                                        this.fileData[j].newWidth=metaData.streams[k].width;
                                        this.fileData[j].newHeight=metaData.streams[k].height;
                                        break;
                                    }
                                }
                                console.log(metaData)
                            });
                        },()=>{
                            if(!this.convertIng)
                                return;
                            common.deleteFile(this.fileData[j].newTmpPath);
                            this.fileData[j].newTmpPath=null;
                            this.fileData[j].status=3;
                            this.convertStart();
                            this.convertOver();
                        });
                    })(i);
                }
            },

            convertOver(){
                if(this.fileConvertPercent==100){
                    setTimeout(() => {
                        this.$alert(this.$t('videoFormatConvert.convertOver'), this.$t('common.tip'), {
                            confirmButtonText: this.$t('common.ok'),
                            callback: action => {
                                this.convertIng=false;
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