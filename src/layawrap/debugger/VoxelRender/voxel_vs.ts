export default `
#include "Lighting.glsl";
attribute vec4 a_Position; 
attribute vec3 a_Normal;
attribute vec2 a_Texcoord0; 
attribute vec2 a_Texcoord1; 

uniform mat4 u_MvpMatrix; 
uniform mat4 u_WorldMat; 

#if defined(DIRECTIONLIGHT)
varying vec3 v_PositionWorld;
#endif
varying vec3 v_Normal;

uniform vec3 u_CameraPos;
varying vec3 v_ViewDir; 

void main() 
{ 
    gl_Position = u_MvpMatrix * a_Position; 
    v_Normal = a_Normal;
	gl_Position=remapGLPositionZ(gl_Position);
}
`;