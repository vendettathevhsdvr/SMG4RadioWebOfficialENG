//----------------------------------------------------------------------------------------
// recording

var rec_showtimer;
var rec_downloadurl;

function record_show()
{
   document.getElementById('reccontrol').innerHTML=Math.round(soundapplet.rec_length_kB())+" kB";
}

function record_start() { 
   document.getElementById('reccontrol').innerHTML=0+" kB";
   if (rec_downloadurl) { URL.revokeObjectURL(rec_downloadurl); rec_downloadurl=null; }
   rec_showtimer=setInterval('record_show()',250);
   soundapplet.rec_start(); 
}

function record_stop()
{
   clearInterval(rec_showtimer);
   var res = soundapplet.rec_finish();

   var wavhead = new ArrayBuffer(44);
   var dv=new DataView(wavhead);
   var i=0;
   var sr=Math.round(res.sr);
   dv.setUint8(i++,82);  dv.setUint8(i++,73); dv.setUint8(i++,70); dv.setUint8(i++,70); // RIFF  (is there really no less verbose way to initialize this thing?)
   dv.setUint32(i,res.len+44,true); i+=4;  // total length; WAV files are little-endian
   dv.setUint8(i++,87);  dv.setUint8(i++,65); dv.setUint8(i++,86); dv.setUint8(i++,69); // WAVE
   dv.setUint8(i++,102);  dv.setUint8(i++,109); dv.setUint8(i++,116); dv.setUint8(i++,32); // fmt
     dv.setUint32(i,16,true);   i+=4;   // length of fmt
     dv.setUint16(i,1,true);    i+=2;   // PCM
     dv.setUint16(i,1,true);    i+=2;   // mono
     dv.setUint32(i,sr,true);   i+=4;   // samplerate
     dv.setUint32(i,2*sr,true); i+=4;   // 2*samplerate
     dv.setUint16(i,2,true);    i+=2;   // bytes per sample
     dv.setUint16(i,16,true);   i+=2;   // bits per sample
   dv.setUint8(i++,100);  dv.setUint8(i++,97); dv.setUint8(i++,116); dv.setUint8(i++,97); // data
     dv.setUint32(i,res.len,true);  // length of data

   var wavdata = res.wavdata;
   wavdata.unshift(wavhead);

   var mimetype = 'application/binary';
   var bb = new Blob(wavdata, {type: mimetype});
   if (!bb) document.getElementById('recwarning').style.display="block";
   rec_downloadurl = window.URL.createObjectURL(bb);
   if (rec_downloadurl.indexOf('http')>=0) document.getElementById('recwarning').style.display="block";
   var fname='';
   try {
      fname=(new Date().toISOString()).replace(/\.[0-9]{3}/,"");
   } catch (e) {};
   fname="smg4radio_recording_"+fname+"_"+nominalfreq().toFixed(1)+"radio.wav";
   document.getElementById('reccontrol').innerHTML="<a href='"+rec_downloadurl+"' download='"+fname+"'>download</a>";
}

function record_click()
{
   var bt=document.getElementById('recbutton');
   if (bt.innerHTML=="stop") {
      bt.innerHTML="start";
      record_stop();
   } else {
      bt.innerHTML="stop";
      record_start();
   }
}
