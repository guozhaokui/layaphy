import { Text } from "./Text";
import { Event } from "../events/Event";
import { Utils } from "../utils/Utils";
import { ILaya } from "../../ILaya";
import { ClassUtils } from "../utils/ClassUtils";
export class Input extends Text {
    constructor() {
        super();
        this._multiline = false;
        this._editable = true;
        this._maxChars = 1E5;
        this._type = "text";
        this._prompt = '';
        this._promptColor = "#A9A9A9";
        this._originColor = "#000000";
        this._content = '';
        Input.IOS_IFRAME = (ILaya.Browser.onIOS && ILaya.Browser.window.top != ILaya.Browser.window.self);
        this._width = 100;
        this._height = 20;
        this.multiline = false;
        this.overflow = Text.SCROLL;
        this.on(Event.MOUSE_DOWN, this, this._onMouseDown);
        this.on(Event.UNDISPLAY, this, this._onUnDisplay);
    }
    static __init__() {
        Input._createInputElement();
        if (ILaya.Browser.onMobile) {
            var isTrue = false;
            if (ILaya.Browser.onMiniGame || ILaya.Browser.onBDMiniGame || ILaya.Browser.onQGMiniGame || ILaya.Browser.onKGMiniGame || ILaya.Browser.onVVMiniGame) {
                isTrue = true;
            }
            ILaya.Render.canvas.addEventListener(Input.IOS_IFRAME ? (isTrue ? "touchend" : "click") : "touchend", Input._popupInputMethod);
        }
    }
    static _popupInputMethod(e) {
        if (!Input.isInputting)
            return;
        var input = Input.inputElement;
        input.focus();
    }
    static _createInputElement() {
        Input._initInput(Input.area = ILaya.Browser.createElement("textarea"));
        Input._initInput(Input.input = ILaya.Browser.createElement("input"));
        Input.inputContainer = ILaya.Browser.createElement("div");
        Input.inputContainer.style.position = "absolute";
        Input.inputContainer.style.zIndex = 1E5;
        ILaya.Browser.container.appendChild(Input.inputContainer);
        Input.inputContainer.setPos = function (x, y) {
            Input.inputContainer.style.left = x + 'px';
            Input.inputContainer.style.top = y + 'px';
        };
    }
    static _initInput(input) {
        var style = input.style;
        style.cssText = "position:absolute;overflow:hidden;resize:none;transform-origin:0 0;-webkit-transform-origin:0 0;-moz-transform-origin:0 0;-o-transform-origin:0 0;";
        style.resize = 'none';
        style.backgroundColor = 'transparent';
        style.border = 'none';
        style.outline = 'none';
        style.zIndex = 1;
        input.addEventListener('input', Input._processInputting);
        input.addEventListener('mousemove', Input._stopEvent);
        input.addEventListener('mousedown', Input._stopEvent);
        input.addEventListener('touchmove', Input._stopEvent);
        input.setFontFace = function (fontFace) { input.style.fontFamily = fontFace; };
        if (!ILaya.Render.isConchApp) {
            input.setColor = function (color) { input.style.color = color; };
            input.setFontSize = function (fontSize) { input.style.fontSize = fontSize + 'px'; };
        }
    }
    static _processInputting(e) {
        var input = Input.inputElement.target;
        if (!input)
            return;
        var value = Input.inputElement.value;
        if (input._restrictPattern) {
            value = value.replace(/\u2006|\x27/g, "");
            if (input._restrictPattern.test(value)) {
                value = value.replace(input._restrictPattern, "");
                Input.inputElement.value = value;
            }
        }
        input._text = value;
        input.event(Event.INPUT);
    }
    static _stopEvent(e) {
        if (e.type == 'touchmove')
            e.preventDefault();
        e.stopPropagation && e.stopPropagation();
    }
    setSelection(startIndex, endIndex) {
        this.focus = true;
        Input.inputElement.selectionStart = startIndex;
        Input.inputElement.selectionEnd = endIndex;
    }
    get multiline() {
        return this._multiline;
    }
    set multiline(value) {
        this._multiline = value;
        this.valign = value ? "top" : "middle";
    }
    get nativeInput() {
        return this._multiline ? Input.area : Input.input;
    }
    _onUnDisplay(e = null) {
        this.focus = false;
    }
    _onMouseDown(e) {
        this.focus = true;
    }
    _syncInputTransform() {
        var inputElement = this.nativeInput;
        var transform = Utils.getTransformRelativeToWindow(this, this.padding[3], this.padding[0]);
        var inputWid = this._width - this.padding[1] - this.padding[3];
        var inputHei = this._height - this.padding[0] - this.padding[2];
        if (ILaya.Render.isConchApp) {
            inputElement.setScale(transform.scaleX, transform.scaleY);
            inputElement.setSize(inputWid, inputHei);
            inputElement.setPos(transform.x, transform.y);
        }
        else {
            Input.inputContainer.style.transform = Input.inputContainer.style.webkitTransform = "scale(" + transform.scaleX + "," + transform.scaleY + ") rotate(" + (ILaya.stage.canvasDegree) + "deg)";
            inputElement.style.width = inputWid + 'px';
            inputElement.style.height = inputHei + 'px';
            Input.inputContainer.style.left = transform.x + 'px';
            Input.inputContainer.style.top = transform.y + 'px';
        }
    }
    select() {
        this.nativeInput.select();
    }
    get focus() {
        return this._focus;
    }
    set focus(value) {
        var input = this.nativeInput;
        if (this._focus !== value) {
            if (value) {
                if (input.target) {
                    input.target._focusOut();
                }
                else {
                    this._setInputMethod();
                }
                input.target = this;
                this._focusIn();
            }
            else {
                input.target = null;
                this._focusOut();
                ILaya.Browser.document.body.scrollTop = 0;
                input.blur();
                if (ILaya.Render.isConchApp)
                    input.setPos(-10000, -10000);
                else if (Input.inputContainer.contains(input))
                    Input.inputContainer.removeChild(input);
            }
        }
    }
    _setInputMethod() {
        Input.input.parentElement && (Input.inputContainer.removeChild(Input.input));
        Input.area.parentElement && (Input.inputContainer.removeChild(Input.area));
        Input.inputElement = (this._multiline ? Input.area : Input.input);
        Input.inputContainer.appendChild(Input.inputElement);
        if (Text.RightToLeft) {
            Input.inputElement.style.direction = "rtl";
        }
    }
    _focusIn() {
        Input.isInputting = true;
        var input = this.nativeInput;
        this._focus = true;
        var cssStyle = input.style;
        cssStyle.whiteSpace = (this.wordWrap ? "pre-wrap" : "nowrap");
        this._setPromptColor();
        input.readOnly = !this._editable;
        if (ILaya.Render.isConchApp) {
            input.setType(this._type);
            input.setForbidEdit(!this._editable);
        }
        input.maxLength = this._maxChars;
        var padding = this.padding;
        input.value = this._content;
        input.placeholder = this._prompt;
        ILaya.stage.off(Event.KEY_DOWN, this, this._onKeyDown);
        ILaya.stage.on(Event.KEY_DOWN, this, this._onKeyDown);
        ILaya.stage.focus = this;
        this.event(Event.FOCUS);
        if (ILaya.Browser.onPC)
            input.focus();
        if (!ILaya.Browser.onMiniGame && !ILaya.Browser.onBDMiniGame && !ILaya.Browser.onQGMiniGame && !ILaya.Browser.onKGMiniGame && !ILaya.Browser.onVVMiniGame) {
            var temp = this._text;
            this._text = null;
        }
        this.typeset();
        input.setColor(this._originColor);
        input.setFontSize(this.fontSize);
        input.setFontFace(ILaya.Browser.onIPhone ? (Text.fontFamilyMap[this.font] || this.font) : this.font);
        if (ILaya.Render.isConchApp) {
            input.setMultiAble && input.setMultiAble(this._multiline);
        }
        cssStyle.lineHeight = (this.leading + this.fontSize) + "px";
        cssStyle.fontStyle = (this.italic ? "italic" : "normal");
        cssStyle.fontWeight = (this.bold ? "bold" : "normal");
        cssStyle.textAlign = this.align;
        cssStyle.padding = "0 0";
        this._syncInputTransform();
        if (!ILaya.Render.isConchApp && ILaya.Browser.onPC)
            ILaya.systemTimer.frameLoop(1, this, this._syncInputTransform);
    }
    _setPromptColor() {
        Input.promptStyleDOM = ILaya.Browser.getElementById("promptStyle");
        if (!Input.promptStyleDOM) {
            Input.promptStyleDOM = ILaya.Browser.createElement("style");
            Input.promptStyleDOM.setAttribute("id", "promptStyle");
            ILaya.Browser.document.head.appendChild(Input.promptStyleDOM);
        }
        Input.promptStyleDOM.innerText = "input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {" + "color:" + this._promptColor + "}" + "input:-moz-placeholder, textarea:-moz-placeholder {" + "color:" + this._promptColor + "}" + "input::-moz-placeholder, textarea::-moz-placeholder {" + "color:" + this._promptColor + "}" + "input:-ms-input-placeholder, textarea:-ms-input-placeholder {" + "color:" + this._promptColor + "}";
    }
    _focusOut() {
        Input.isInputting = false;
        this._focus = false;
        this._text = null;
        this._content = this.nativeInput.value;
        if (!this._content) {
            super.set_text(this._prompt);
            super.set_color(this._promptColor);
        }
        else {
            super.set_text(this._content);
            super.set_color(this._originColor);
        }
        ILaya.stage.off(Event.KEY_DOWN, this, this._onKeyDown);
        ILaya.stage.focus = null;
        this.event(Event.BLUR);
        this.event(Event.CHANGE);
        if (ILaya.Render.isConchApp)
            this.nativeInput.blur();
        ILaya.Browser.onPC && ILaya.systemTimer.clear(this, this._syncInputTransform);
    }
    _onKeyDown(e) {
        if (e.keyCode === 13) {
            if (ILaya.Browser.onMobile && !this._multiline)
                this.focus = false;
            this.event(Event.ENTER);
        }
    }
    set text(value) {
        super.set_color(this._originColor);
        value += '';
        if (this._focus) {
            this.nativeInput.value = value || '';
            this.event(Event.CHANGE);
        }
        else {
            if (!this._multiline)
                value = value.replace(/\r?\n/g, '');
            this._content = value;
            if (value)
                super.set_text(value);
            else {
                super.set_text(this._prompt);
                super.set_color(this.promptColor);
            }
        }
    }
    get text() {
        if (this._focus)
            return this.nativeInput.value;
        else
            return this._content || "";
    }
    changeText(text) {
        this._content = text;
        if (this._focus) {
            this.nativeInput.value = text || '';
            this.event(Event.CHANGE);
        }
        else
            super.changeText(text);
    }
    set color(value) {
        if (this._focus)
            this.nativeInput.setColor(value);
        super.set_color(this._content ? value : this._promptColor);
        this._originColor = value;
    }
    get color() {
        return super.color;
    }
    set bgColor(value) {
        super.set_bgColor(value);
        if (ILaya.Render.isConchApp)
            this.nativeInput.setBgColor(value);
    }
    get bgColor() {
        return super.bgColor;
    }
    get restrict() {
        if (this._restrictPattern) {
            return this._restrictPattern.source;
        }
        return "";
    }
    set restrict(pattern) {
        if (pattern) {
            pattern = "[^" + pattern + "]";
            if (pattern.indexOf("^^") > -1)
                pattern = pattern.replace("^^", "");
            this._restrictPattern = new RegExp(pattern, "g");
        }
        else
            this._restrictPattern = null;
    }
    set editable(value) {
        this._editable = value;
        if (ILaya.Render.isConchApp) {
            Input.input.setForbidEdit(!value);
        }
    }
    get editable() {
        return this._editable;
    }
    get maxChars() {
        return this._maxChars;
    }
    set maxChars(value) {
        if (value <= 0)
            value = 1E5;
        this._maxChars = value;
    }
    get prompt() {
        return this._prompt;
    }
    set prompt(value) {
        if (!this._text && value)
            super.set_color(this._promptColor);
        this.promptColor = this._promptColor;
        if (this._text)
            super.set_text((this._text == this._prompt) ? value : this._text);
        else
            super.set_text(value);
        this._prompt = Text.langPacks && Text.langPacks[value] ? Text.langPacks[value] : value;
    }
    get promptColor() {
        return this._promptColor;
    }
    set promptColor(value) {
        this._promptColor = value;
        if (!this._content)
            super.set_color(value);
    }
    get type() {
        return this._type;
    }
    set type(value) {
        if (value === "password")
            this._getTextStyle().asPassword = true;
        else
            this._getTextStyle().asPassword = false;
        this._type = value;
    }
}
Input.TYPE_TEXT = "text";
Input.TYPE_PASSWORD = "password";
Input.TYPE_EMAIL = "email";
Input.TYPE_URL = "url";
Input.TYPE_NUMBER = "number";
Input.TYPE_RANGE = "range";
Input.TYPE_DATE = "date";
Input.TYPE_MONTH = "month";
Input.TYPE_WEEK = "week";
Input.TYPE_TIME = "time";
Input.TYPE_DATE_TIME = "datetime";
Input.TYPE_DATE_TIME_LOCAL = "datetime-local";
Input.TYPE_SEARCH = "search";
Input.IOS_IFRAME = false;
Input.inputHeight = 45;
Input.isInputting = false;
ClassUtils.regClass("laya.display.Input", Input);
ClassUtils.regClass("Laya.Input", Input);
