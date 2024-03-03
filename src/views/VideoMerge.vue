<template>
    <div class="my-container">
        <div class="left">
            <template v-if="(fileData==null || fileData.length==0) && !tableLoading">
                <div class="add-file-cover">
                    <i class="my-icon my-icon-add-video" @click="dialogOpenFile"></i>
                    <div class="tip">{{$t('common.addFileTip')}}{{videoExtArr.join(', ')}}</div>
                    <div class="add-filt-btn-box">
                        <el-button type="primary" size="large" class="add-file-btn" plain @click="dialogOpenFile">
                            <i class="my-icon my-icon-file"></i>
                            <span>{{$t('common.addVideoBtn')}}</span>
                        </el-button>
                        <el-tooltip :content="$t('common.addDirTip')" placement="top">
                            <el-button type="primary" size="large" class="add-file-btn" plain @click="dialogOpenDirectory">
                                <i class="my-icon my-icon-folder"></i>
                                <span>{{$t('common.addDirBtn')}}</span>
                            </el-button>
                        </el-tooltip>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="table-top">
                    <el-button type="primary" size="small" @click="dialogOpenFile" :disabled="mergeOptions.mergeIng">
                        <i class="my-icon my-icon-file"></i>
                        <span>{{$t('common.addVideoBtn')}}</span>
                    </el-button>
                    <el-tooltip :content="$t('common.addDirTip')" placement="top">
                        <el-button type="primary" size="small" @click="dialogOpenDirectory" :disabled="mergeOptions.mergeIng">
                            <i class="my-icon my-icon-folder"></i>
                            <span>{{$t('common.addDirBtn')}}</span>
                        </el-button>
                    </el-tooltip>
                    <el-button type="danger" size="small" @click="fileData=[]" :disabled="mergeOptions.mergeIng">
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
                    <el-table-column prop="sourcePath" :label="$t('videoMerge.sourcePath')" min-width="150px">
                        <template #default="scope">
                            <div @click="openPath(scope.row.sourcePath)" style="cursor: pointer;">{{scope.row.sourcePath}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceSize" :label="$t('videoMerge.sourceSize')" min-width="80px" show-overflow-tooltip align="right">
                        <template #default="scope">
                            {{scope.row.sourceSize!=null?(scope.row.sourceSize/1024/1024).toFixed(2)+"MB":""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceDuration" :label="$t('videoMerge.sourceDuration')" min-width="100px" show-overflow-tooltip align="right">
                        <template #default="scope">
                            {{scope.row.sourceDuration!=null?transDurationStr(scope.row.sourceDuration):""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceVideoBitrate" :label="$t('videoMerge.sourceVideoBitrate')" min-width="90px" show-overflow-tooltip align="right">
                        <template #default="scope">
                            {{scope.row.sourceVideoBitrate!=null?(scope.row.sourceVideoBitrate/1024).toFixed(0)+"kbps":""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceFrameRate" :label="$t('videoMerge.sourceFrameRate')" min-width="80px" show-overflow-tooltip align="right">
                        <template #default="scope">
                            {{scope.row.sourceFrameRate!=null?scope.row.sourceFrameRate+"fps":""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceResolution" :label="$t('common.videoResolution')" min-width="110px" show-overflow-tooltip align="right">
                        <template #default="scope">
                            {{scope.row.sourceWidth!=null && scope.row.sourceHeight!=null?scope.row.sourceWidth+"x"+scope.row.sourceHeight:""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceAudioBitrate" :label="$t('common.audioBitrate')" min-width="90px" show-overflow-tooltip align="right">
                        <template #default="scope">
                            {{scope.row.sourceAudioBitrate!=null?(scope.row.sourceAudioBitrate/1024).toFixed(0)+"kbps":""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceSampleRate" :label="$t('common.audioSampleRate')" min-width="90px" show-overflow-tooltip align="right">
                        <template #default="scope">
                            {{scope.row.sourceSampleRate!=null?scope.row.sourceSampleRate+"Hz":""}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('videoMerge.operate')" width="90px" fixed="right" align="center">
                        <template #default="scope">
                            <div class="operate">
                                <i class="my-icon my-icon-shangyi" :class="{'disabled': (scope.$index==0 && pageIndex==1) || mergeOptions.mergeIng}" @click="moveUpFileDataRow(scope)" :title="$t('videoMerge.moveUp')"></i>
                                <i class="my-icon my-icon-xiayi" :class="{'disabled': scope.$index+(pageIndex-1)*pageSize==fileData.length-1 || mergeOptions.mergeIng}" @click="moveDownFileDataRow(scope)" :title="$t('videoMerge.moveDown')"></i>
                                <i class="my-icon my-icon-cuo" :class="{'disabled': mergeOptions.mergeIng}" @click="delFileData(scope)" :title="$t('videoMerge.delete')"></i>
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
            <div class="title">{{$t('videoMerge.mergeSetting')}}</div>
            <el-form :model="mergeOptions" :rules="mergeOptionsRules" ref="mergeOptionsForm" label-position="top" size="small">
                <el-form-item :label="$t('videoMerge.playSpeed')">
                    <el-select class="content" v-model="mergeOptions.speed" :disabled="mergeOptions.mergeIng" :placeholder="$t('common.selectTip')">
                        <el-option v-for="item in videoSpeedArr" :key="item" :label="item+'x'" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <el-tooltip placement="top">
                            <template #content>
                                <div style="line-height: 24px;">{{$t('videoMerge.videoBitrateTip')}}</div>
                            </template>
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{$t('videoMerge.sourceVideoBitrate')}}
                    </template>
                    <el-select class="content" v-model="mergeOptions.videoBitrate" :disabled="mergeOptions.mergeIng" :placeholder="$t('common.selectTip')">
                        <el-option v-for="item in videoBitrateArr" :key="item" :label="item+' kbps'" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <el-tooltip placement="top">
                            <template #content>
                                <div style="line-height: 24px;">{{$t('videoMerge.videoBitrateTip')}}</div>
                            </template>
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{$t('videoMerge.sourceFrameRate')}}
                    </template>
                    <el-select class="content" v-model="mergeOptions.frameRate" :disabled="mergeOptions.mergeIng" :placeholder="$t('common.selectTip')">
                        <el-option v-for="item in frameRateArr" :key="item" :label="item+' fps'" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('common.videoResolution')">
                    <el-select class="content" v-model="mergeOptions.resolution" :disabled="mergeOptions.mergeIng" :placeholder="$t('common.selectTip')">
                        <el-option v-for="(item,key) in resolutionArr" :key="key" :label="item" :value="key"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="mergeOptions.resolution=='custom'" prop="customResolution" :label="$t('common.customResolution')">
                    <div style="display: flex;">
                        <el-input class="content" v-model="mergeOptions.customVideoWidth" :disabled="mergeOptions.mergeIng" :placeholder="$t('common.width')" clearable></el-input>
                        <span style="padding:0 3px;">x</span>
                        <el-input class="content" v-model="mergeOptions.customVideoHeight" :disabled="mergeOptions.mergeIng" :placeholder="$t('common.height')" clearable></el-input>
                    </div>
                </el-form-item>
                <el-form-item :label="$t('common.audioBitrate')">
                    <el-select class="content" v-model="mergeOptions.audioBitrate" :disabled="mergeOptions.mergeIng || mergeOptions.noAudio" :placeholder="$t('common.selectTip')">
                        <el-option v-for="item in audioBitrateArr" :key="item" :label="item+' kbps'" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('common.audioSampleRate')">
                    <el-select class="content" v-model="mergeOptions.audioSampleRate" :disabled="mergeOptions.mergeIng || mergeOptions.noAudio" :placeholder="$t('common.selectTip')">
                        <el-option v-for="item in audioSampleRateArr" :key="item" :label="item+' Hz'" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <!-- <el-form-item :label="$t('videoMerge.volume')">
                    <el-slider class="content slider"
                        v-model="mergeOptions.volume" 
                        :disabled="mergeOptions.mergeIng || mergeOptions.noAudio"
                        :min="0.1" 
                        :max="2"
                        :step="0.01"
                        :format-tooltip="volumeTooltip">
                    </el-slider>
                </el-form-item> -->
                <el-form-item :label="$t('videoMerge.noAudio')">
                    <div style="position: relative;">
                        <el-switch v-model="mergeOptions.noAudio" :disabled="mergeOptions.mergeIng"></el-switch>
                    </div>
                </el-form-item>
            </el-form>
            <div class="bottom">
                <el-progress v-if="mergeOptions.mergeIng || mergeOptions.mergePercent!=0" :percentage="mergeOptions.mergePercent" class="progress" :text-inside="true" :stroke-width="20" text-color="#fff"></el-progress>
                <el-button type="primary" size="large" class="btn-process" @click="goMerge" :disabled="fileData==null || fileData.length<=1 || fileMergePercent==100">{{mergeOptions.mergeIng?$t('videoMerge.mergeStop'):$t('videoMerge.mergeStart')}}</el-button>
            </div>
        </div>
    </div>
</template>

<script>
    import common from '../utils/common';
    import { toRaw } from '@vue/reactivity'

    export default {
        name: 'VideoMerge',
        data() {
            var checkCustomResolution = (rule, value, callback) => {
                if(this.isNullOrEmpty(this.mergeOptions.customVideoWidth) || this.isNullOrEmpty(this.mergeOptions.customVideoHeight)){
                    callback(new Error(this.$t('common.customResolutionRequired')));
                } else if(isNaN(this.mergeOptions.customVideoWidth) || !/^[0-9]+$/.test(this.mergeOptions.customVideoWidth)){
                    callback(new Error(this.$t('common.mustBeInt')));
                } else if(isNaN(this.mergeOptions.customVideoHeight) || !/^[0-9]+$/.test(this.mergeOptions.customVideoHeight)){
                    callback(new Error(this.$t('common.mustBeInt')));
                } else {
                    callback();
                }
            };

            return {
                videoExtArr:['mp4','mov','avi','mkv','ts','flv','swf','mpeg','mpg','m4v','vob','wmv'],
                videoBitrateArr:[500,1000,2000,3000,4000,5000,6000,7000,8000,9000,10000,12000,14000,16000,18000,20000],
                frameRateArr:[18,20,24,25,30,48,50,60],
                audioBitrateArr:[16,32,48,64,96,128,160,192,220,256,320],
                audioSampleRateArr:[8000,11025,12000,16000,22050,24000,32000,44100,48000,96000],
                videoSpeedArr:[4,2,1,0.5,0.25],

                fileData:[],
                tableLoading:false,
                pageIndex: 1,
                pageSize: 100,

                mergeOptions:{
                    mergeIng:false,
                    speed:1,
                    videoBitrate:4000,
                    frameRate:25,
                    resolution:'1024x576',
                    customVideoWidth:null,
                    customVideoHeight:null,
                    audioBitrate:128,
                    audioSampleRate:44100,
                    volume:1,
                    noAudio:false,
                    outputFileFullPath:null,
                    mergeVideoTempDirName:'MergeVideoTempDir',
                    mergeVideoTempDirPath:'',
                    mergePercent:0,
                    concatFileContent:''
                },
                mergeOptionsRules: {
                    customResolution: [
                        { required: true, validator: checkCustomResolution, trigger: 'blur'}
                    ]
                },
            }
        },
        computed:{
            filePageData(){
                return this.fileData.slice((this.pageIndex-1)*this.pageSize,this.pageIndex*this.pageSize);
            },

            fileMergePercent(){
                if(this.fileData.length==0)
                    return 0;
                var filterData = this.fileData.filter(item => {
                    return item.status == 2 || item.status == 3
                });
                
                return parseInt((filterData.length/this.fileData.length)*100,10);
            },

            resolutionArr(){
                return {
                    "custom":this.$t('common.customResolution'),
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
        mounted() {
        },
        methods: {
            toNum(str){
                if(this.isNullOrEmpty(str) || isNaN(str))
                    return null;
                else
                    return Number(str);
            },

            dialogOpenFile(type){
                var extArr=[];
                var multiSelections;
                if(type=='cutVideo'){
                    extArr=['mp4'];
                    multiSelections=false;
                }else{
                    extArr=toRaw(this.videoExtArr);
                    multiSelections=true;
                }
                common.dialogOpenFile(extArr,multiSelections)
                .then(filePaths=>{
                    if(filePaths!=null && filePaths.length>0){
                        this.tableLoading=true;
                        setTimeout(()=>{
                            for(var i=0;i<filePaths.length;i++){
                                this.fileData.push({
                                    sourcePath:filePaths[i],
                                    sourceSize:null,
                                    sourceDuration:null,
                                    sourceVideoBitrate:null,
                                    sourceFrameRate:null,
                                    sourceWidth:null,
                                    sourceHeight:null,
                                    sourceAudioBitrate:null,
                                    sourceSampleRate:null,
                                    processed:false
                                });
                            }
                            this.tableLoading=false;
                            this.setMediaMetaData();
                        },100);
                    }
                });
            },

            dialogOpenDirectory(){
                common.dialogOpenDirectory()
                .then(dirPaths=>{
                    if(dirPaths==null || dirPaths=='')
                        return;
                    var fileData = common.getFilesFromDir(dirPaths,toRaw(this.videoExtArr));
                    if(fileData!=null && fileData.length>0){
                        this.tableLoading=true;
                        setTimeout(()=>{
                            for(var i=0;i<fileData.length;i++){
                                this.fileData.push({
                                    sourcePath:fileData[i].filePath,
                                    sourceSize:null,
                                    sourceDuration:null,
                                    sourceVideoBitrate:null,
                                    sourceFrameRate:null,
                                    sourceWidth:null,
                                    sourceHeight:null,
                                    sourceAudioBitrate:null,
                                    sourceSampleRate:null,
                                    processed:false
                                });
                            }
                            this.tableLoading=false;
                            this.setMediaMetaData();
                        },100);
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
                            curData.forEach(item=>{
                                try{
                                    item.sourceSize=metaData.format.size;
                                    item.sourceDuration=metaData.format.duration;
                                    for(var k=0;k<metaData.streams.length;k++){
                                        if(metaData.streams[k].codec_type=='video'){
                                            item.sourceVideoBitrate=metaData.streams[k].bit_rate;
                                            item.sourceFrameRate=Number(eval(metaData.streams[k].r_frame_rate).toFixed(0));
                                            item.sourceWidth=metaData.streams[k].width;
                                            item.sourceHeight=metaData.streams[k].height;
                                        }else if(metaData.streams[k].codec_type=='audio'){
                                            item.sourceAudioBitrate=metaData.streams[k].bit_rate;
                                            item.sourceSampleRate=metaData.streams[k].sample_rate;
                                        }
                                    }
                                }catch(e){
                                    console.log(e);
                                }
                            });
                            gf.next();
                        });
                    }
                }

                var gf = gengeratorFun();
                gf.next();
            },

            pageIndexChange(e) {
                this.pageIndex = e;
            },
            
            delFileData(scope){
                if(this.mergeOptions.mergeIng){
                    return;
                }
                var rowIndex=(this.pageIndex-1)*this.pageSize+scope.$index;
                this.fileData.splice(rowIndex,1);
            },
            moveUpFileDataRow(scope){
                var rowIndex=(this.pageIndex-1)*this.pageSize+scope.$index;
                if(rowIndex==0 || this.mergeOptions.mergeIng){
                    return;
                }
                this.fileData[rowIndex-1] = this.fileData.splice(rowIndex, 1, this.fileData[rowIndex-1])[0];
            },
            moveDownFileDataRow(scope){
                var rowIndex=(this.pageIndex-1)*this.pageSize+scope.$index;
                if(rowIndex==this.fileData.length-1 || this.mergeOptions.mergeIng){
                    return;
                }
                this.fileData[rowIndex+1] = this.fileData.splice(rowIndex, 1, this.fileData[rowIndex+1])[0];
            },
            
            volumeTooltip(val){
                return parseInt(val*100,10)+'%';
            },
            
            transDurationStr(duration){
                var durationInt=parseInt(duration,10);
                var durationStr=duration.toFixed(3)+"";
                var hour=parseInt(durationInt/(60*60),10)
                var minute=parseInt((durationInt%(60*60))/60,10)
                var second=parseInt(durationInt%60,10)
                return (hour<10?"0"+hour:hour)+":"+
                    (minute<10?"0"+minute:minute)+":"+
                    (second<10?"0"+second:second)+
                    durationStr.substring(durationStr.indexOf('.'));
            },

            killMergeVideoCommand(){
                common.killMergeVideoCommand();
                this.mergeOptions.mergeIng=false;
                this.fileData.forEach(t=>{
                    t.processed=false;
                });
                this.mergeOptions.mergePercent=0;
                setTimeout(() => {
                    common.deleteDir(this.mergeOptions.mergeVideoTempDirPath);
                }, 1000);
            },
            goMerge(){
                if(this.mergeOptions.mergeIng){
                    this.killMergeVideoCommand();
                    return;
                }

                this.$refs['mergeOptionsForm'].validate((valid) => {
                    if (valid) {
                        common.diaglogSaveFile(toRaw(this.videoExtArr))
                        .then(filePath=>{
                            if(this.isNullOrEmpty(filePath))return;
                            this.mergeOptions.outputFileFullPath=filePath.replace(/\\/g,"/");
                            this.mergeOptions.mergeVideoTempDirPath=
                                this.mergeOptions.outputFileFullPath.substring(0,this.mergeOptions.outputFileFullPath.lastIndexOf('/'))
                                +"/"+this.mergeOptions.mergeVideoTempDirName;
                            common.makeDir(this.mergeOptions.mergeVideoTempDirPath);

                            this.mergeOptions.mergeIng=true;
                            this.mergeOptions.concatFileContent='';
                            this.processVideoForMerge();
                        });
                    }
                });
            },
            processVideoForMerge(){
                for(var i=0;i<this.fileData.length;i++){
                    if(!this.mergeOptions.mergeIng)
                        return;
                    
                    if(this.fileData[i].processed){
                        continue;
                    }

                    var tempVideoPath=this.mergeOptions.mergeVideoTempDirPath+'/'+i+'.ts';
                    common.processVideoForMerge(this.fileData[i].sourcePath, tempVideoPath, {
                        duration:this.fileData[i].sourceDuration,
                        speed:this.mergeOptions.speed,
                        videoBitrate:this.mergeOptions.videoBitrate,
                        frameRate:this.mergeOptions.frameRate,
                        resolution: this.mergeOptions.resolution=='custom' ? this.mergeOptions.customVideoWidth+'x'+this.mergeOptions.customVideoHeight : this.mergeOptions.resolution,
                        audioBitrate:this.mergeOptions.audioBitrate,
                        audioSampleRate:this.mergeOptions.audioSampleRate,
                        volume:this.mergeOptions.volume,
                        noAudio:this.mergeOptions.noAudio
                    },(progress)=>{
                        if(this.isNullOrEmpty(progress.percent))return;
                        var percentData=[0,0];
                        for(var j=0;j<this.fileData.length;j++){
                            if(j<i){
                                percentData[0]+=Number(this.fileData[j].sourceSize);
                            }else if(j==i){
                                percentData[0]+=parseInt(Number(this.fileData[j].sourceSize)*progress.percent/100,10);
                            }
                            percentData[1]+=Number(this.fileData[j].sourceSize);
                        }
                        percentData[1]+=10000;
                        this.mergeOptions.mergePercent=Number(((percentData[0]/percentData[1])*100).toFixed(1));
                    },()=>{
                        this.fileData[i].processed=true;
                        this.mergeOptions.concatFileContent+=(i!=0?'|':'')+tempVideoPath;
                        var filterData = this.fileData.filter(item => {
                            return !item.processed
                        });
                        if(filterData.length==0){
                            this.mergeVideo();
                        }else{
                            this.processVideoForMerge();
                        }
                    },()=>{
                        this.$message.error(this.$t('videoMerge.mergeFailed'));
                        this.killMergeVideoCommand();
                    });

                    break;
                }
            },
            mergeVideo(){
                common.mergeVideo(this.mergeOptions.outputFileFullPath,this.mergeOptions.concatFileContent,()=>{
                    this.mergeOptions.mergePercent=100;
                    setTimeout(() => {
                        common.deleteDir(this.mergeOptions.mergeVideoTempDirPath);
                    }, 1000);
                    this.$alert(this.$t('videoMerge.mergeOver'), this.$t('common.tip'), {
                        confirmButtonText: this.$t('common.ok'),
                        callback: action => {
                            this.mergeOptions.mergePercent=0;
                            this.mergeOptions.mergeIng=false;
                        }
                    });
                },()=>{
                    this.$message.error(this.$t('videoMerge.mergeFailed'));
                    this.killMergeVideoCommand();
                });
            },

            openPath(url){
                common.openPath(url);
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>