<template>
    <div class="my-container">
        <div class="left">
            <template v-if="videoPath==null">
                <div class="add-file-cover">
                    <i class="my-icon my-icon-add-video" @click="dialogOpenFile"></i>
                    <div class="tip">{{$t('videoCut.addVideoTip1')}}<br>{{$t('videoCut.addVideoTip2')}} &nbsp;<el-link type="primary" @click="$router.push('/video-format-conversion')">{{$t('videoCut.addVideoTip3')}}</el-link></div>
                    <div class="add-filt-btn-box">
                        <el-button type="primary" size="large" class="add-file-btn" plain @click="dialogOpenFile">
                            <i class="my-icon my-icon-file"></i>
                            <span>{{$t('common.addVideoBtn')}}</span>
                        </el-button>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="table-top" style="display: flex;align-items: center;">
                    <el-button type="primary" size="small" @click="dialogOpenFile" :disabled="cutOptions.cutting">
                        <i class="my-icon my-icon-file"></i>
                        <span>{{$t('videoCut.replaceVideo')}}</span>
                    </el-button>
                    <span class="ellipsis" style="margin-bottom: 5px;color:#777;font-size:12px;" :title="videoPath">{{videoPath}}</span>
                </div>
                <video id="video" width="100%" height="200" class="video" 
                    @ended="videoPlaying=false" 
                    @play="videoPlaying=true" 
                    @pause="videoPlaying=false"
                    @timeupdate="videoPlayTimeUpdate"
                    @click="videoPlayPause"
                    :src="videoPath">
                </video>
                <div class="play-control">
                    <div class="slider">
                        <el-slider v-model="videoSliderValue" 
                            :min="0" 
                            :max="videoSliderMax" 
                            @change="videoSliderChange"
                            @input="videoSliderInput"
                            :format-tooltip="videoSliderFormatTooltip">
                        </el-slider>
                    </div>
                    <div class="control">
                        <div style="display: flex;align-items: center;">
                            <el-tooltip placement="top" :content="videoPlaying?$t('videoCut.pause'):$t('videoCut.play')">
                                <i class="my-icon" :class="{'my-icon-play':!videoPlaying,'my-icon-pause':videoPlaying}" @click="videoPlayPause"></i>
                            </el-tooltip>
                            <el-tooltip placement="top" :content="$t('videoCut.prevFrame')">
                                <i class="my-icon my-icon-prev-frame" @click="prevFrame"></i>
                            </el-tooltip>
                            <el-tooltip placement="top" :content="$t('videoCut.nextFrame')">
                                <i class="my-icon my-icon-next-frame" @click="nextFrame"></i>
                            </el-tooltip>
                            <el-tooltip placement="top">
                                <template #content>
                                    <div class="speed-list">
                                        <template v-for="item in videoSpeedArr">
                                            <div @click="videoSpeedChange(item)">{{item}}x</div>
                                        </template>
                                    </div>
                                </template>
                                <span class="speed">{{videoSpeed}}x</span>
                            </el-tooltip>
                            <span class="time">{{videoPlayDurationStr}} / {{videoTotalDurationStr}}</span>
                        </div>
                        <div class="set-time">
                            <span class="item" @click="setCutStartTime">{{$t('videoCut.setStartTime')}}</span>
                            <span class="item" @click="setCutEndTime">{{$t('videoCut.setEndTime')}}</span>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        <div class="setting">
            <div class="title">{{$t('videoCut.cutSetting')}}</div>
            <el-form :model="cutOptions" ref="cutOptionsForm" label-position="top" size="small">
                <el-form-item :label="$t('videoCut.playSpeed')">
                    <el-select class="content" v-model="cutOptions.speed" :disabled="cutOptions.cutting" :placeholder="$t('common.selectTip')">
                        <el-option v-for="item in videoSpeedArr" :key="item" :label="item+'x'" :value="item"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('videoCut.startTime')" prop="startTime" :rules="{required: true, message: $t('videoCut.startTimeTip'), trigger: 'blur'}">
                    <div style="position: relative;width:100%">
                        <el-input class="content" v-model="cutOptions.startTime" :disabled="cutOptions.cutting" :placeholder="$t('videoCut.startTimeTip')"></el-input>
                        <div style="position: absolute;top: 0;bottom: 0;left: 0;right: 0;z-index: 10;" :title="$t('videoCut.startTimeTip')"></div>
                    </div>
                </el-form-item>
                <el-form-item :label="$t('videoCut.endTime')" prop="endTime" :rules="{required: true, message: $t('videoCut.endTimeTip'), trigger: 'blur'}">
                    <div style="position: relative;width:100%">
                        <el-input class="content" v-model="cutOptions.endTime" :disabled="cutOptions.cutting" :placeholder="$t('videoCut.endTimeTip')"></el-input>
                        <div style="position: absolute;top: 0;bottom: 0;left: 0;right: 0;z-index: 10;" :title="$t('videoCut.endTimeTip')"></div>
                    </div>
                </el-form-item>
                <!-- <el-form-item :label="$t('videoCut.volume')">
                    <el-slider class="content slider"
                        v-model="cutOptions.volume"
                        :disabled="cutOptions.cutting || cutOptions.noAudio"
                        :min="0.1" 
                        :max="2"
                        :step="0.01"
                        :format-tooltip="volumeTooltip">
                    </el-slider>
                </el-form-item> -->
                <el-form-item :label="$t('videoCut.noAudio')">
                    <div style="position: relative;">
                        <el-switch v-model="cutOptions.noAudio" :disabled="cutOptions.cutting"></el-switch>
                    </div>
                </el-form-item>
            </el-form>
            <div class="bottom">
                <el-progress v-if="cutOptions.cutting || cutOptions.cutPercent!=0" :percentage="cutOptions.cutPercent" class="progress" :text-inside="true" :stroke-width="20" text-color="#fff"></el-progress>
                <el-button type="primary" size="large" class="btn-process" @click="goCut" :disabled="videoPath==null || cutOptions.cutPercent==100">
                    {{cutOptions.cutting?$t('videoCut.stopCutting'):$t('videoCut.startCutting')}}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script>
    import common from '../utils/common';
    import { toRaw } from '@vue/reactivity'

    export default {
        name: 'VideoCut',
        data() {
            return {
                tabActiveName: 'cut',

                videoExtArr:['mp4','mov','avi','mkv','ts','flv','swf','mpeg','mpg','m4v','vob','wmv'],
                videoBitrateArr:[500,1000,2000,3000,4000,5000,6000,7000,8000,9000,10000,12000,14000,16000,18000,20000],
                audioBitrateArr:[64,96,128,160,192,256,320],
                frameRateArr:[18,20,24,25,30,48,50,60],

                tableLoading:false,

                videoSpeedArr:[4,2,1,0.5,0.25],
                videoElement:null, //video播放器元素对象
                videoPath:null, //视频路径
                videoDuration:0, //视频时常
                videoFrameRate:null, //视频帧速率
                videoPlayTime:0, //视频当前播放的时长
                videoSliderValue:0, //视频播放进度条值，值为videoPlayTime*1000
                videoPlaying:false, //视频是否在播放中
                videoSpeed:1, //视频播放倍速
                cutOptions:{
                    cutting:false,
                    speed:1,
                    startTime:null,
                    endTime:null,
                    volume:1,
                    noAudio:false,
                    outputFileFullPath:null,
                    cutPercent:0
                }
            }
        },
        computed:{
            //视频播放时长时分秒字符串
            videoPlayDurationStr(){
                var time=this.videoPlayTime>this.videoDuration?this.videoDuration:this.videoPlayTime
                return this.transDurationStr(time);
            },
            videoTotalDurationStr(){
                return this.transDurationStr(this.videoDuration);
            },
            videoSliderMax(){
                return parseInt(this.videoDuration*1000,10)
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

            dialogOpenFile(){
                var extArr=['mp4'];
                var multiSelections=false;
                common.dialogOpenFile(extArr,multiSelections)
                .then(filePaths=>{
                    if(filePaths!=null && filePaths.length>0){
                        common.getMediaMetaData(filePaths[0],(metaData)=>{
                            console.log(metaData)
                            if(this.videoPath!=null)
                                this.getVideoElement().currentTime=0;
                            this.videoPath=filePaths[0];
                            this.videoDuration=metaData.format.duration;
                            for(var k=0;k<metaData.streams.length;k++){
                                if(metaData.streams[k].codec_type=='video'){
                                    this.videoFrameRate=Number(eval(metaData.streams[k].r_frame_rate).toFixed(0));
                                }
                            }
                            this.videoPlayTime=0;
                            this.videoSliderValue=0;
                            this.videoPlaying=false;
                            this.cutOptions.startTime=null;
                            this.cutOptions.endTime=null;
                        });
                    }
                });
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

            getVideoElement(){
                if(this.videoElement==null)
                    this.videoElement=document.getElementById("video");
                return this.videoElement;
            },
            videoPlayPause(){
                if (this.getVideoElement().paused){
                    this.videoPlaying=true;
                    this.getVideoElement().play();
                } else {
                    this.videoPlaying=false;
                    this.getVideoElement().pause();
                }
            },
            videoSpeedChange(speed){
                this.videoSpeed=speed;
                this.getVideoElement().playbackRate=speed;
                document.querySelectorAll('.el-tooltip__popper').forEach(item=>{
                    item.style.display='none';
                });
            },
            videoPlayTimeUpdate(){
                this.videoPlayTime=this.getVideoElement().currentTime;
                this.videoSliderValue=parseInt(this.videoPlayTime*1000,10);
            },
            videoSliderInput(e){
                if(e!=parseInt(this.videoPlayTime*1000,10)){
                    this.getVideoElement().pause();
                    this.getVideoElement().currentTime=e/1000;
                }
            },
            videoSliderChange(e){
                this.getVideoElement().play();
            },
            videoSliderFormatTooltip(val){
                return this.transDurationStr(val/1000);
            },
            prevFrame(){
                this.getVideoElement().currentTime-=Number((1/this.videoFrameRate).toFixed(3));
                this.getVideoElement().pause();
            },
            nextFrame(){
                this.getVideoElement().currentTime+=Number((1/this.videoFrameRate).toFixed(3));
                this.getVideoElement().pause();
            },
            setCutStartTime(){
                if(!this.cutOptions.cutting){
                    this.cutOptions.startTime=this.videoPlayDurationStr;
                    this.$refs['cutOptionsForm'].clearValidate(['startTime']);
                }else{
                    this.$message.warning(this.$t('videoCut.settingTimeTip1'));
                }
            },
            setCutEndTime(){
                if(!this.cutOptions.cutting){
                    this.cutOptions.endTime=this.videoPlayDurationStr;
                    this.$refs['cutOptionsForm'].clearValidate(['endTime']);
                }else{
                    this.$message.warning(this.$t('videoCut.settingTimeTip1'));
                }
            },
            goCut(){
                if(this.cutOptions.cutting){
                    common.killCutVideoCommand();
                    this.cutOptions.cutting=false;
                    this.cutOptions.cutPercent=0;
                    setTimeout(() => {
                        common.deleteFile(this.cutOptions.outputFileFullPath);
                    }, 1000);
                    return;
                }
                this.$refs['cutOptionsForm'].validate((valid) => {
                    if (valid) {
                        var startTimeArr = this.cutOptions.startTime.split(':');
                        var startTime=Number(startTimeArr[0]) * 3600 + Number(startTimeArr[1]) * 60 + Number(startTimeArr[2]);
                        var endTimeArr = this.cutOptions.endTime.split(':');
                        var endTime=Number(endTimeArr[0]) * 3600 + Number(endTimeArr[1]) * 60 + Number(endTimeArr[2]);
                        if(startTime>=endTime){
                            this.$message.error(this.$t('videoCut.settingTimeTip2'));
                            return;
                        }
                        
                        common.diaglogSaveFile(toRaw(this.videoExtArr))
                        .then(filePath=>{
                            if(this.isNullOrEmpty(filePath))return;
                            this.cutOptions.cutting=true;
                            
                            this.cutOptions.outputFileFullPath=filePath;

                            var opts={
                                seekInput:startTime,
                                duration:endTime-startTime,
                                speed:this.cutOptions.speed,
                                volume:this.cutOptions.volume,
                                noAudio:this.cutOptions.noAudio
                            };
                            common.cutVideo(this.videoPath, this.cutOptions.outputFileFullPath, opts,
                            (progress)=>{
                                if(this.isNullOrEmpty(progress.percent))return;
                                this.cutOptions.cutPercent=Number(progress.percent.toFixed(1));
                            },()=>{
                                setTimeout(() => {
                                    this.cutOptions.cutPercent=100;
                                    this.$alert(this.$t('videoCut.cutOver'), this.$t('common.tip'), {
                                        confirmButtonText: this.$t('common.ok'),
                                        callback: action => {
                                            this.cutOptions.cutPercent=0;
                                            this.cutOptions.cutting=false;
                                        }
                                    });
                                }, 800);
                            },()=>{
                                this.cutOptions.cutPercent=0;
                                this.cutOptions.cutting=false;
                                this.$message.error(this.$t('videoCut.cutFailed'));
                                setTimeout(() => {
                                    common.deleteFile(this.cutOptions.outputFileFullPath);
                                }, 1000);
                            });
                        });;
                    }
                });
            }
        }
    }
</script>

<style lang="scss" scoped>
    .video{background-color: #000;flex:1;border:0;outline: none;width:100%;}
    .play-control{width:100%;background: #000;color:#fff;
        .slider{
            padding:0 10px;
            .el-slider{height: unset!important;}
        }
        .control{
            display: flex;justify-content: space-between;align-items: center;margin: 5px 0;line-height: 24px;
            i{padding:10px;cursor: pointer;}
            .speed{padding:10px;cursor: pointer;}
            .time{margin: 0 10px;}
            .set-time{display: flex;flex-direction: column;align-items: flex-end;margin-right: 10px;}
            .set-time .item{cursor: pointer;}
        }
    }
    .speed-list{border-radius: 4px;color:#fff;line-height:26px;}
    .speed-list div{cursor: pointer;}
</style>