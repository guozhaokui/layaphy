export default `
#include "Lighting.glsl";
attribute vec4 a_Position; 
attribute vec2 a_Texcoord0; 
attribute vec2 a_Texcoord1; 

uniform mat4 u_MvpMatrix; 
uniform mat4 u_WorldMat; 

#if defined(DIRECTIONLIGHT)
varying vec3 v_PositionWorld;
#endif

void main() 
{ 
    gl_Position = u_MvpMatrix * a_Position; 
	gl_Position=remapGLPositionZ(gl_Position);
}
`;