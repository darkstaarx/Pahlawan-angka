// Original deterministic thunder impact: sharp crack, deep body, fading rumble.
const fs=require('fs'),path=require('path');
const rate=44100,duration=1.65,n=Math.floor(rate*duration),samples=new Float64Array(n);
let seed=27419,low=0,mid=0,peak=0;
for(let i=0;i<n;i++){
  const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const noise=seed/2147483648-1;low+=.012*(noise-low);mid+=.16*(noise-mid);
  const attack=Math.min(1,t/.002);
  const crack=(noise-mid)*Math.exp(-t*38)*.48;
  const rumble=low*5.8*Math.exp(-t*2.8)*(1+.25*Math.sin(t*29));
  const body=Math.sin(2*Math.PI*(70*t-12*t*t))*Math.exp(-t*9)*.38;
  const v=(crack+rumble+body)*attack*Math.min(1,(duration-t)/.15);
  samples[i]=v;peak=Math.max(peak,Math.abs(v));
}
const wav=Buffer.alloc(44+n*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(n*2,40);
for(let i=0;i<n;i++)wav.writeInt16LE(Math.round(samples[i]/peak*.88*32767),44+i*2);
fs.writeFileSync(path.join(__dirname,'../assets/audio/glacier-thunder.wav'),wav);
