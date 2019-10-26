export default`
precision highp float; 

attribute vec4 a_Position; 
attribute vec3 a_Normal;
#ifdef COLOR
	attribute vec4 a_Color;
#endif
attribute vec2 a_Texcoord0; 
attribute vec2 a_Texcoord1; 

varying vec4 vertColor;

uniform mat4 u_WorldMat; 
uniform mat4 u_MvpMatrix; 
//uniform mat4 g_persmat; 
uniform vec3 u_CameraPos;

varying vec2 vUv;
varying vec3 norm; 

varying vec4 vWorldPos;
varying vec3 vWorldNorm;   
varying vec3 vViewDir;

void main(){
    vWorldPos = u_WorldMat*vec4(a_Position);
	//gl_Position = g_persmat*vec4(vWorldPos.xyz-u_CameraPos,1.0);
	gl_Position = u_MvpMatrix * vec4(a_Position); 
	 
	norm = a_Normal; 
	vUv=a_Texcoord0;
    vertColor = vec4(1.0,1.0,1.0,1.0);//g_Color;

    vWorldNorm = normalize((u_WorldMat*vec4(a_Normal,0.0)).xyz);    
    vViewDir = (vWorldPos.xyz-u_CameraPos);//这个不能normalize。否则无法线性差值了
}
`