import Sphere from "../shapes/Sphere";

    test('throwOnWrongRadius',()=>{

        // These should be all right
        new Sphere(1);
        new Sphere(0);

        expect(new Sphere(-1)).toThrow('Should throw on negative radius');
    });

