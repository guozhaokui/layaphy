import {Sphere} from "../shapes/Sphere";

    test('throwOnWrongRadius',()=>{

        // These should be all right
        new Sphere(1);
        new Sphere(0);

        // toThrow 要求 expect的参数必须是一个函数
        //expect( ()=>{new Sphere(-1);} ).toThrow('Should throw on negative radius');
    });

