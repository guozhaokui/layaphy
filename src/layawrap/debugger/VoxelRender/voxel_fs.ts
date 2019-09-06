export default `
#ifdef FSHIGHPRECISION 
precision highp float;
#else
precision mediump float;
#endif
void main()
{ 
    gl_FragColor = vec4(.4, .4, 0.4, 1.0);
}
`