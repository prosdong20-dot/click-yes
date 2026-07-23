const $=id=>document.getElementById(id);
const LEVEL_SIZE=1000;
const items=[
 {id:'thimble',icon:'🪡',name:'Steel Thimble',desc:'+1 click power',base:150,gain:1,type:'power'},
 {id:'mouse',icon:'🖱️',name:'Slow Mouse',desc:'+1 cookie / sec',base:450,gain:1,type:'cps'},
 {id:'glove',icon:'🧤',name:'Titanium Glove',desc:'+4 click power',base:1600,gain:4,type:'power'},
 {id:'baker',icon:'🧑‍🍳',name:'Night Baker',desc:'+5 cookies / sec',base:4800,gain:5,type:'cps'},
 {id:'hammer',icon:'🔨',name:'Cookie Crusher',desc:'+18 click power',base:15000,gain:18,type:'power'},
 {id:'oven',icon:'🔥',name:'Volcanic Oven',desc:'+30 cookies / sec',base:47000,gain:30,type:'cps'},
 {id:'laser',icon:'⚡',name:'Plasma Finger',desc:'+90 click power',base:160000,gain:90,type:'power'},
 {id:'factory',icon:'🏭',name:'Dark Factory',desc:'+180 cookies / sec',base:520000,gain:180,type:'cps'},
 {id:'portal',icon:'🌀',name:'Quantum Portal',desc:'+500 click power',base:1800000,gain:500,type:'power'},
 {id:'moon',icon:'🌙',name:'Cookie Moon',desc:'+1.2K cookies / sec',base:6500000,gain:1200,type:'cps'},
 {id:'star',icon:'🌟',name:'Sugar Star',desc:'+4K click power',base:28000000,gain:4000,type:'power'},
 {id:'universe',icon:'🌌',name:'Cookie Universe',desc:'+12K cookies / sec',base:110000000,gain:12000,type:'cps'}
];
let game={score:0,power:1,cps:0,level:1,owned:{},total:0,sound:true};
try{game={...game,...JSON.parse(localStorage.getItem('click-yes-save')||'{}')}}catch(e){}
let combo=1,lastClick=0,audio;
const fmt=n=>n>=1e12?(n/1e12).toFixed(1)+'T':n>=1e9?(n/1e9).toFixed(1)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':Math.floor(n).toLocaleString();
const cost=i=>Math.ceil(i.base*Math.pow(1.85,game.owned[i.id]||0));
function clickSound(critical=false){
 if(!game.sound)return;
 audio ||= new (window.AudioContext||window.webkitAudioContext)();
 const now=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();
 o.type=critical?'sawtooth':'sine';o.frequency.setValueAtTime(critical?190:120+Math.random()*35,now);o.frequency.exponentialRampToValueAtTime(critical?520:75,now+.075);
 g.gain.setValueAtTime(critical?.16:.11,now);g.gain.exponentialRampToValueAtTime(.001,now+.09);o.connect(g).connect(audio.destination);o.start(now);o.stop(now+.1);
}
function buySound(){if(!game.sound)return;audio ||= new (window.AudioContext||window.webkitAudioContext)();[330,440,660].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.055;o.frequency.value=f;g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.13)})}
function save(){localStorage.setItem('click-yes-save',JSON.stringify(game))}
function drawShop(){$('upgrades').innerHTML=items.map(i=>{const own=game.owned[i.id]||0,c=cost(i);return `<button class="upgrade" id="${i.id}" ${game.score<c?'disabled':''}><span class="icon">${i.icon}</span><span><b>${i.name}</b><small>${i.desc} · <span class="owned">Owned ${own}</span></small></span><em>${fmt(c)} 🍪</em></button>`}).join('');items.forEach(i=>$(i.id).onclick=()=>buy(i))}
function update(oldLevel=game.level){game.level=Math.floor(game.total/LEVEL_SIZE)+1;const into=game.total%LEVEL_SIZE;$('score').textContent=fmt(game.score);$('level').textContent=game.level;$('power').textContent=fmt(game.power);$('cps').textContent=fmt(game.cps);$('progressText').textContent=`${fmt(LEVEL_SIZE-into)} cookies until level ${game.level+1}`;$('progressBar').style.width=`${into/LEVEL_SIZE*100}%`;$('sound').textContent=game.sound?'🔊 Sound on':'🔇 Sound off';if(game.level>oldLevel){$('levelMessage').textContent=`LEVEL ${game.level}!`;$('levelMessage').classList.remove('show');void $('levelMessage').offsetWidth;$('levelMessage').classList.add('show')}drawShop();save()}
function buy(i){const c=cost(i);if(game.score<c)return;game.score-=c;game.owned[i.id]=(game.owned[i.id]||0)+1;game[i.type]+=i.gain;buySound();update()}
$('cookie').onclick=e=>{const now=Date.now();combo=now-lastClick<520?Math.min(combo+.08,2.5):1;lastClick=now;const critical=Math.random()<.04,amount=Math.max(1,Math.floor(game.power*combo*(critical?4:1))),old=game.level;game.score+=amount;game.total+=amount;clickSound(critical);update(old);$('combo').textContent=`COMBO ×${combo.toFixed(1)}`;$('combo').classList.toggle('hot',combo>=1.7);$('cookie').classList.add('hit');setTimeout(()=>$('cookie').classList.remove('hit'),85);const f=document.createElement('span');f.className='floater'+(critical?' critical':'');f.textContent=critical?`CRIT +${fmt(amount)}!`:`+${fmt(amount)}`;f.style.left=e.clientX+'px';f.style.top=e.clientY+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),760)};
setInterval(()=>{if(Date.now()-lastClick>750){combo=1;$('combo').textContent='COMBO ×1';$('combo').classList.remove('hot')}if(game.cps>0){const old=game.level;game.score+=game.cps;game.total+=game.cps;update(old)}},1000);
$('sound').onclick=()=>{game.sound=!game.sound;update();if(game.sound)clickSound()};
$('reset').onclick=()=>{if(confirm('Reset every cookie and upgrade in click.yes?')){game={score:0,power:1,cps:0,level:1,owned:{},total:0,sound:true};combo=1;update()}};
update();
