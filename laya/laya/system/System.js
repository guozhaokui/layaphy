export class System {
    static changeDefinition(name, classObj) {
        window.Laya[name] = classObj;
        var str = name + "=classObj";
        window['eval'](str);
    }
}
