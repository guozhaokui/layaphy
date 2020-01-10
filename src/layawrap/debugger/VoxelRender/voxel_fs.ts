export default`
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
    vec2 scrcoord = mod(gl_FragCoord.xy-vec2(0.5),2.0);
    float d = dot(scrcoord,scrcoord);
    //if(d==0.0)discard;
 	float l = (1.0+dot(lightdir,v_Normal))/2.0;
    gl_FragColor = vec4(l,l,l,.5);
}
`