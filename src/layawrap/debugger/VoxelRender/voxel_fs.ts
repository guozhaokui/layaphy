export default `
#ifdef FSHIGHPRECISION 
precision highp float;
#else
precision mediump float;
#endif
varying vec3 v_Normal;
varying vec3 v_ViewDir; 
vec3 lightdir=normalize(vec3(2,1,0));

void main()
{ 
	float l = dot(lightdir,v_Normal);
    gl_FragColor = vec4(l,l,l,1.0);
}
`