export default`
precision highp float;
#define TEST

const float PI = 3.14159265358979323846264;
const float _2PI = 6.2831853071796;


uniform sampler2D texBaseColor;
uniform sampler2D texNormal;
uniform sampler2D texPrefilterdEnv;
uniform sampler2D texBRDFLUT;

varying vec2 vUv,tex1;
varying vec3 norm;
varying vec4 vertColor;

varying vec3 vWorldNorm;
varying vec3 vViewDir;
varying vec4 vWorldPos;


uniform mat4 irrad_mat_red;
uniform mat4 irrad_mat_green;
uniform mat4 irrad_mat_blue;	

uniform vec4 u_roughness_metaless_hdrexp;

const float maxlv = 7.;	//现在只支持512分辨率的环境贴图
const int nmaxlv = 9;//

const float _maxu8 = 255.0;
const float _maxu16 = 65535.0;
const float _shift8 = 256.0;    //平移的话是*256而不是255

vec3 speccontrib = vec3(0.);


uniform vec4 u_DiffuseColor;


vec2 _RGBAToU16(const in vec4 rgba){
    return vec2((rgba.r*_maxu8+rgba.g*_maxu8*_shift8)/_maxu16, (rgba.b*_maxu8+rgba.a*_maxu8*_shift8)/_maxu16);
}
vec3 _RGBEToRGB( const in vec4 rgba ){
    float f = pow(2.0, rgba.w * 255.0 - (128.0 + 8.0));
    return rgba.rgb * (255.0 * f);
}

float saturate(float v){
    return min(max(v,0.),1.);
}

vec4 tex2dLod(sampler2D tex, float u, float v, float lod){
	vec2 uv = vec2(u,v);
	uv+=mod(gl_FragCoord.xy-vec2(0.5),2.0)*vec2(128.,0.);
	return texture2D(tex,uv,lod-16.);
}

/*
* 对一个全景图进行采样。假设x轴指向中心。
*/
vec4 texPanorama(sampler2D tex, const in vec3 dir){
	float envu = atan(dir.z,dir.x)/_2PI+0.5; 	
	float envv = acos(dir.y)/PI;//(1.0-dir.y)/2.0;
	return texture2D(tex,vec2(envu,envv));
}

vec4 texPanoramaLod(sampler2D tex, const in vec3 dir, float lod){
	float envu = atan(dir.z,dir.x)/_2PI+0.5; 	
	float envv = acos(dir.y)/PI;//(1.0-dir.y)/2.0;
	return tex2dLod(tex,envu,envv,lod);
}

/*
    计算sh光照。
    使用level=2，所以需要9个系数。
    https://cseweb.ucsd.edu/~ravir/papers/envmap/envmap.pdf
*/
float environment_exposure = 1.0;
vec3 diff_sh9(vec3 dir){
	vec4 shDir = vec4(dir.x,-dir.z,dir.y,1.0);
  return max(vec3(0.0), vec3(
	dot(shDir, irrad_mat_red * shDir),
	dot(shDir, irrad_mat_green * shDir),
	dot(shDir, irrad_mat_blue * shDir)
	)) * environment_exposure;	
}

vec4 pbrlight(vec3 normal, float rough, float NoV, vec3 R){
    vec4 basecolor = vertColor;// texture2D(texBaseColor,vUv);
	//basecolor.rgb = pow(basecolor.rgb,vec3(2.2));
	float metaless = 0.0; 	
    const vec3 nonmetalF0 =vec3(0.02);
    vec3 F0 =  mix(nonmetalF0, basecolor.rgb, metaless);
	
    vec4 PrefilteredColor = texPanoramaLod(texPrefilterdEnv, R, rough*maxlv);
    PrefilteredColor.rgb = _RGBEToRGB(PrefilteredColor);
    vec4 EnvBRDF = texture2D(texBRDFLUT,vec2(rough , NoV));//TODO lod
    vec2 rg = _RGBAToU16(EnvBRDF);    
    speccontrib = (F0* rg.x + saturate( 50.0 * PrefilteredColor.g ) * rg.y);
	vec3 color_spec = PrefilteredColor.rgb*speccontrib;
	
	vec3 color_diff=diff_sh9(normal);
	vec3 outc =  color_diff*mix(basecolor.rgb,vec3(0.),metaless)*(vec3(1.0)-speccontrib)+color_spec;
	return vec4(outc, basecolor.a);
}

void main(){
    vec3 normal =  normalize(vWorldNorm);

    vec3 view   = -normalize(vViewDir);
    float NoV = saturate(dot( view, normal ));
    vec3 R = 2. * NoV * normal - view;
    float roughness = 0.2;

    vec4 pbrl = pbrlight(normal,roughness,NoV,R);//*u_roughness_metaless_hdrexp.z;
    //vec4 pbrl = vertColor*vec4(diff_sh9(normal),1.0)*u_roughness_metaless_hdrexp.z;
    //pbrl.xyz*=vec3(0.2,0.3,0.9);
    gl_FragColor.rgb = pow(pbrl.rgb,vec3(0.45455));
    //gl_FragColor.rgb = normal;

	//vec4 col1 = texture2D(g_Tex1,vUv);
	//gl_FragColor=vec4(col1.xyz, 1);
    gl_FragColor.a=1.0;
}
`