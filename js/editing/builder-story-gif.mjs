// GIF89a with a fixed 3-3-2 palette. Frequent clear codes keep LZW at nine bits.
export function suggestedStorySeconds(text=''){const words=text.trim().split(/\s+/).filter(Boolean).length;return words?Math.max(3,Math.ceil(words/2+1.5)):1;}
export function encodeStoryGif(width,height,frames){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>1600||height>1200||!frames.length||frames.length>24)throw new Error('Choose 1–24 frames at a supported size.');
 const out=[],byte=n=>out.push(n&255),word=n=>{byte(n);byte(n>>8);},text=s=>{for(const c of s)byte(c.charCodeAt(0));};
 text('GIF89a');word(width);word(height);byte(0xf7);byte(0);byte(0);
 for(let i=0;i<256;i++){byte(Math.round((i>>5)*255/7));byte(Math.round(((i>>2)&7)*255/7));byte((i&3)*85);}
 byte(0x21);byte(0xff);byte(11);text('NETSCAPE2.0');byte(3);byte(1);word(0);byte(0);
 for(const frame of frames){
  if(frame.rgba.length!==width*height*4)throw new Error('Frame size does not match.');
  byte(0x21);byte(0xf9);byte(4);byte(4);word(Math.max(5,Math.min(65535,Math.round(frame.seconds*100)||100)));byte(0);byte(0);
  byte(0x2c);word(0);word(0);word(width);word(height);byte(0);byte(8);
  const data=[];let bits=0,count=0;const code=n=>{bits|=n<<count;count+=9;while(count>=8){data.push(bits&255);bits>>>=8;count-=8;}};
  code(256);let literals=0;
  for(let i=0;i<frame.rgba.length;i+=4){if(literals===200){code(256);literals=0;}code((frame.rgba[i]&224)|((frame.rgba[i+1]>>3)&28)|(frame.rgba[i+2]>>6));literals++;}
  code(257);if(count)data.push(bits&255);
  for(let i=0;i<data.length;i+=255){const size=Math.min(255,data.length-i);byte(size);for(let j=0;j<size;j++)byte(data[i+j]);}byte(0);
 }
 byte(0x3b);return new Uint8Array(out);
}
