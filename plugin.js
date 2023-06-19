const entrypoint = (state)=>{
    /*ULID*/const script = document.createElement('script');script.src = 'https://cdn.jsdelivr.net/npm/ulid@2.3.0/dist/index.umd.min.js';document.head.appendChild(script);
    //Copyright (c) 2015 Yuji Miyane
    //https://github.com/higuma/wav-audio-encoder-js
    (function(n){const min=Math.min,max=Math.max,e=function(n,a,e){const s=e.length;for(let t=0;t<s;++t)n.setUint8(a+t,e.charCodeAt(t))},t=function(t,e){this.sampleRate=t;this.numChannels=e;this.numSamples=0;this.dataViews=[]};t.prototype.encode=function(r){const t=r[0].length,u=this.numChannels,h=new DataView(new ArrayBuffer(t*u*2));let o=0;for(let e=0;e<t;++e)for(let n=0;n<u;++n){const i=r[n][e]*32767;h.setInt16(o,i<0?max(i,-32768):min(i,32767),true);o+=2}this.dataViews.push(h);this.numSamples+=t};t.prototype.finish=function(s){const n=this.numChannels*this.numSamples*2,t=new DataView(new ArrayBuffer(44));e(t,0,"RIFF");t.setUint32(4,36+n,true);e(t,8,"WAVE");e(t,12,"fmt ");t.setUint32(16,16,true);t.setUint16(20,1,true);t.setUint16(22,this.numChannels,true);t.setUint32(24,this.sampleRate,true);t.setUint32(28,this.sampleRate*4,true);t.setUint16(32,this.numChannels*2,true);t.setUint16(34,16,true);e(t,36,"data");t.setUint32(40,n,true);this.dataViews.unshift(t);const a=new Blob(this.dataViews,{type:"audio/x-wav"});this.cleanup();return a};t.prototype.cancel=t.prototype.cleanup=function(){this.dataViews = []};n.WavAudioEncoder=t})(self);
    //end copyright
    const mic=document.createElement('a'); mic.classList.add('bGwznd');mic.classList.add('fIbyPH');mic.id = "recordmic";mic.innerHTML = `<svg version="1.1" width="24" height="24" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" fill="white"><g transform="matrix(1, 0, 0, 1, 3, 5)"><path d="M 45 0 c -8.481 0 -15.382 6.9 -15.382 15.382 v 29.044 c 0 8.482 6.9 15.382 15.382 15.382 s 15.382 -6.9 15.382 -15.382 V 15.382 C 60.382 6.9 53.481 0 45 0 z" stroke-linecap="round"/><path d="M 69.534 33.119 C 68.43 33.119 67.534 34.015 67.534 35.119 L 67.534 41.624 C 67.534 53.89 57.555 63.868 45.289 63.868 C 33.023 63.868 23.044 53.889 23.044 41.624 L 23.044 35.119 C 23.044 34.015 22.148 33.119 21.044 33.119 C 19.94 33.119 19.044 34.015 19.044 35.119 L 19.044 41.624 C 19.044 55.421 29.749 66.758 43.289 67.784 L 43.289 80.807 L 34.163 80.807 C 33.059 80.807 32.163 81.703 32.163 82.807 C 32.163 83.911 33.059 84.807 34.163 84.807 L 56.415 84.807 C 57.519 84.807 58.415 83.911 58.415 82.807 C 58.415 81.703 57.519 80.807 56.415 80.807 L 47.289 80.807 L 47.289 67.785 C 60.829 66.759 71.534 55.422 71.534 41.625 L 71.534 35.12 C 71.534 34.015 70.639 33.119 69.534 33.119 Z" stroke-linecap="round"/></g></svg>`;
    let allowed=false;
    class ChronoText extends HTMLSpanElement {
        constructor(){super();this._prefix='Grabando ';this.textContent=this._prefix +'00:00';this.seconds=0;this.interval=0;}

        start(limit){
            this.interval=setInterval(()=>{
                this.seconds++;if(limit && this.seconds>limit)this.stop();else this.textContent=this._prefix+ChronoText.formatTime(this.seconds);
            },1000);
        }
        stop(){
            clearInterval(this.interval);
            if(this.seconds>1) this.dispatchEvent(new Event('timestopped'));
            else this.dispatchEvent(new Event('cancelled'));
            this.seconds=0;
        }
        static formatTime(seconds){
            return Math.floor(seconds/60).toString().padStart(2,'0')+':'+seconds.toString().padStart(2,'0')
        }
    }
    customElements.define("chrono-text", ChronoText, { extends: "span"});
    let t = document.createElement('span', {is: 'chrono-text'});
    class StatusBar extends HTMLDivElement {
        constructor(){super();this.style.position='relative';const bar = document.createElement('div');bar.style.top='-26px';
            this.classList.add('fUFJYB');this.id ='recordme_st';this.appendChild(bar);
        }
    }
    customElements.define("status-bar", StatusBar, { extends: "div"});
    const st = document.createElement('div', {is: 'status-bar'});
    function request(){
        insrtStatus();updateStatus('Puedo grabar porfi?');
        navigator.mediaDevices.getUserMedia({audio: true}).then(_=>{
            mic.addEventListener('mouseup', ()=>t.stop());
            mic.addEventListener('mousedown', record);
            updateStatus('Mantén presionado para grabar');
            allowed=true;
        }).catch(_=>updateStatus('Micrófono inhabilitado. Permiso al micrófono requerido.'));
    }
    function record(){
        const media = navigator.mediaDevices.getUserMedia({audio: true});
        if(allowed) media.then(onMediaStream).catch(e=>console.error(e));
        else request();
    }
    const bufferSize = 2048, HOST = location.hostname, encoder = new WavAudioEncoder(48000, 2), audioCtx = new AudioContext(), proc = audioCtx.createScriptProcessor(bufferSize,2,2);let source;
    function stop(){
        const b = encoder.finish();
        if(source){
            source.disconnect();
            proc.disconnect();
            source=null;
        }
        mic.firstChild.setAttribute('fill','white');
        updateStatus('Subiendo a autumn');
        uploadFile(controllers.client.configuration.features.autumn.url,'attachments', b).then(fileID=>{
            if(!fileID){updateStatus('Subida de audio falló', true);return Promise.reject('UPLOAD FAILED');}
            updateStatus('Creando mensaje de voz');
            const channelMatch = location.pathname.match(/channel\/([A-Z0-9]{26})/);
            if(channelMatch.length < 2) throw new Error("CHANNEL NOT FOUND IN " + location.href);
            return sendMessage(channelMatch[1], fileID)
        }).then(_=>updateStatus('Mantén presionado para grabar',true)).catch(e=>updateStatus('Mensaje de voz no pudo ser enviado', true));;
    }
    function onMediaStream(stream){
          source = audioCtx.createMediaStreamSource(stream);
          proc.onaudioprocess = function(ev){
            const l = ev.inputBuffer.getChannelData(0);
            const r = ev.inputBuffer.getChannelData(1);
            encoder.encode([l,r]);
          };
          source.connect(proc);
          proc.connect(audioCtx.destination);
          mic.firstChild.setAttribute('fill','cyan');
          insrtStatus();
          startTime();
    }
    function insrtStatus(initialText){
        const a = document.querySelector("[class^=MessageArea]");
        const ss = document.styleSheets[3];
        for(const rule of ss.cssRules){
            if(rule.selectorText=='.fUFJYB > div')rule.style.setProperty('top','-52px');
            if(rule.selectorText=='.kpVPRw > div')rule.style.setProperty('padding-bottom','52px');
        }
        st.firstChild.appendChild(t);
        if(initialText && typeof initialText=='string') t.textContent = initialText;
        if(!document.querySelector('#recordme_st'))a.after(st);
    }
    function updateStatus(text, hide=false){
        t.textContent = text;
        if(hide) setTimeout(clearStatus, 3000);
    }
    function startTime(){t.start(180);t.addEventListener('timestopped',stop);t.addEventListener('cancelled',cancel)}
    function cancel(){
        encoder.cancel();
        if(source){
            source.disconnect();
            proc.disconnect();
            source=null;
        }
        mic.firstChild.setAttribute('fill','white');
        clearStatus();
    }
    function clearStatus(){
        t.remove();
        t = document.createElement('span', {is: 'chrono-text'});
        const ss = document.styleSheets[3];
        for(const rule of ss.cssRules){
            if(rule.selectorText=='.fUFJYB > div')rule.style.setProperty('top','-26px');
            if(rule.selectorText=='.kpVPRw > div')rule.style.setProperty('padding-bottom','26px');
        }
    }
    function sendMessage(channelID, fileID){
        const body = JSON.stringify({"content":"","replies":[],"attachments":[fileID]});
        return fetch(`https://app.revolt.chat/api/channels/${channelID}/messages`, {
            method: 'POST',
            body: body,
            headers: {'Content-Type': 'application/json', 'X-Session-Token': controllers.client.getReadyClient().session.token}
        })
    }
    async function uploadFile(autumnURL, tag, binary){
        const formData = new FormData();formData.append("file", binary, new Date(Date.now()).toISOString().slice(0,-5) + ".wav");
        const res = await fetch(`${autumnURL}/${tag}`, {
            method: 'POST',
            body: formData
        }).then(res=>res.json());
        return res.id
    }
    let found=false;
    setInterval(()=>{
            if(document.querySelector('[class^=MessageBox__Blocked]'))return;
            if(found || document.querySelector('#recordmic'))return;
            const box = document.querySelector("[class^='MessageBox__Base']");
            if(box){insrtMic(box);found=true}
    }, 500);
    function insrtMic(messageBox){
        const div = document.createElement('div');div.appendChild(mic);messageBox.appendChild(div);request();
    }
    let actual = location.pathname;
    setInterval(()=>{
        if(location.pathname != actual && location.hostname == HOST){
            actual = location.pathname;
            found = false;
        }
    },1000)
    return {onClient: c=>{console.log("Cliente cargado");},onUnload: ()=>{console.log("Plugin RecordMe desactivado.");}}
};

state.plugins.add({format: 1,version: "1.0.2",id:"recordme",namespace:"account0123",entrypoint: entrypoint.toString()});
