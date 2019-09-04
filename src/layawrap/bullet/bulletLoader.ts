let utf8decoder = new TextDecoder("utf-8");
let mem = new WebAssembly.Memory({ 'initial': 32 });
let u8buffer = new Uint8Array(mem.buffer);
let f32buffer = new Float32Array(mem.buffer);
let f64buffer = new Float64Array(mem.buffer);
let u32buffer = new Uint32Array(mem.buffer);
let i32buffer = new Int32Array(mem.buffer);
var bullet:BulletExport = {} as BulletExport;

export function getBullet():BulletExport|null{
    return bullet;
}

function strlen(str:i32):i32{
    let st=str;
    if(u8buffer.byteLength==0)
        u8buffer = new Uint8Array(mem.buffer);//不知道为什么这里u8buffer不对了，只能重建。是grow了？
    while(u8buffer[str++]!=0){}
    return str-st;
}

export async function loadBullet(wasm:string):Promise<BulletExport> {
    const response = await fetch(wasm);
    const buffer = await response.arrayBuffer();
    const obj = await WebAssembly.instantiate(buffer, {
        BTJSRT: {
            log: (str: i32, len: i32, f1: f32, f2: f32, f3: f32) => {
                let arr = mem.buffer.slice(str, str + len);
                console.log(utf8decoder.decode(arr), f1, f2, f3);
            },
            logs:(str:i32)=>{
                let len = strlen(str);
                let arr = mem.buffer.slice(str, str + len);
                console.log(utf8decoder.decode(arr));
            }
        },
        wasi_unstable: {
            fd_close: () => { console.log('close'); throw 'notimp';},
            fd_seek: () => { console.log('seek'); throw 'notimp';},
            fd_fdstat_get: () => { console.log('get');throw 'notimp'; },
            fd_write: () => { console.log('write'); throw 'notimp'; }
        },
        env: {
            memory: mem,
        }
    });
    //console.log(obj.instance.exports.test());  // "3"  
    let bulletExp = obj.instance.exports as BulletExport;
    Object.assign(bullet,bulletExp);
    bullet.mem = mem;
    bullet.buffer=mem.buffer;
    bullet.u8buffer=u8buffer;
    bullet.u32buffer=u32buffer;
    bullet.f32buffer=f32buffer;
    bullet.f64buffer= f64buffer;
    bullet.i32buffer = i32buffer;
    // 检查编译参数,避免float32，float64不对应
    let chkptr = bullet.getCheckPtr()>>3;
    if(f64buffer[chkptr]!=0.125){
        throw 'wasm check error!';
    }
    return  bullet as BulletExport;
}
