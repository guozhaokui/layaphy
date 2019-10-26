import { Texture2D } from "laya/resource/Texture2D";
import { BaseTexture } from "laya/resource/BaseTexture";

var texMap = new Map<string, Texture2D>();

function getEnvTexture(texture: string): Texture2D {
	throw '';
}

export function loadEnvTexture(texture: string, onload: (tex: Texture2D) => void): void {
	fetch(texture).
		then((value) => {
			return value.arrayBuffer();
		}).then(data => {
			let _mipmaps: Uint8Array[] = [];
			var szinfo = new Uint32Array(data);
			let _width = szinfo[0];
			var validw = 512;
			if (_width != validw) {
				console.error("现在只支持512x256的环境贴图。当前的是" + szinfo[0]);
				throw "现在只支持512x256的环境贴图。当前的是" + szinfo[0];
			}
			let _height = szinfo[1];
			var curw = _width;
			var curh = _height;
			var cursz = 8;
			while (true) {
				var curbufsz = curw * curh * 4;
				if (cursz + curbufsz > data.byteLength) {
					throw "load mipmaps data size error ";
				}
				var tbuf = new Uint8Array(data, cursz, curbufsz);
				_mipmaps.push(tbuf);
				cursz += curbufsz;
				if (curw == 1 && curh == 1) {
					break;
				}
				curw /= 2;
				curh /= 2;
				if (curw < 1) curw = 1;
				if (curh < 1) curh = 1;
			}
			if (_mipmaps.length > 0) {
				let tex = new Texture2D(_width, _height, BaseTexture.FORMAT_R8G8B8A8, true);
				tex.wrapModeU = WebGLRenderingContext.REPEAT;
				tex.wrapModeV = WebGLRenderingContext.CLAMP_TO_EDGE;
				tex.filterMode = BaseTexture.FILTERMODE_BILINEAR;
				for (let i = 0; i < _mipmaps.length; i++) {
					//gl.texImage2D( gl.TEXTURE_2D, i, gl.RGBA, cw, ch, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(_mipmaps[i]));
					tex.setPixels(new Uint8Array(_mipmaps[i]), i);
				}

				onload(tex);
			}
		});
}

export function loadLUTTex() {
	//准备pbrlut贴图
	var lutdt: number[] = (window as any)['__pbrlutdata'];
	if(!lutdt){
		throw 'no lut data';
	}
	let u32Data = new Uint32Array(lutdt);
	let tex = new Texture2D(256, 256, BaseTexture.FORMAT_R8G8B8A8, false);
	tex.setPixels(new Uint8Array(u32Data.buffer));
	tex.wrapModeU = BaseTexture.WARPMODE_CLAMP;
	tex.wrapModeV = BaseTexture.WARPMODE_CLAMP;
	tex.filterMode = BaseTexture.FILTERMODE_POINT;

	return tex;
}