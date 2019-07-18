import { Event } from "../events/Event";
import { EventDispatcher } from "../events/EventDispatcher";
import { Browser } from "../utils/Browser";
import { Byte } from "../utils/Byte";
export class Socket extends EventDispatcher {
    constructor(host = null, port = 0, byteClass = null, protocols = null) {
        super();
        this.disableInput = false;
        this.protocols = [];
        this._byteClass = byteClass ? byteClass : Byte;
        this.protocols = protocols;
        this.endian = Socket.BIG_ENDIAN;
        if (host && port > 0 && port < 65535)
            this.connect(host, port);
    }
    get input() {
        return this._input;
    }
    get output() {
        return this._output;
    }
    get connected() {
        return this._connected;
    }
    get endian() {
        return this._endian;
    }
    set endian(value) {
        this._endian = value;
        if (this._input != null)
            this._input.endian = value;
        if (this._output != null)
            this._output.endian = value;
    }
    connect(host, port) {
        var url = "ws://" + host + ":" + port;
        this.connectByUrl(url);
    }
    connectByUrl(url) {
        if (this._socket != null)
            this.close();
        this._socket && this.cleanSocket();
        if (!this.protocols || this.protocols.length == 0) {
            this._socket = new Browser.window.WebSocket(url);
        }
        else {
            this._socket = new Browser.window.WebSocket(url, this.protocols);
        }
        this._socket.binaryType = "arraybuffer";
        this._output = new this._byteClass();
        this._output.endian = this.endian;
        this._input = new this._byteClass();
        this._input.endian = this.endian;
        this._addInputPosition = 0;
        this._socket.onopen = (e) => {
            this._onOpen(e);
        };
        this._socket.onmessage = (msg) => {
            this._onMessage(msg);
        };
        this._socket.onclose = (e) => {
            this._onClose(e);
        };
        this._socket.onerror = (e) => {
            this._onError(e);
        };
    }
    cleanSocket() {
        this.close();
        this._connected = false;
        this._socket.onopen = null;
        this._socket.onmessage = null;
        this._socket.onclose = null;
        this._socket.onerror = null;
        this._socket = null;
    }
    close() {
        if (this._socket != null) {
            try {
                this._socket.close();
            }
            catch (e) {
            }
        }
    }
    _onOpen(e) {
        this._connected = true;
        this.event(Event.OPEN, e);
    }
    _onMessage(msg) {
        if (!msg || !msg.data)
            return;
        var data = msg.data;
        if (this.disableInput && data) {
            this.event(Event.MESSAGE, data);
            return;
        }
        if (this._input.length > 0 && this._input.bytesAvailable < 1) {
            this._input.clear();
            this._addInputPosition = 0;
        }
        var pre = this._input.pos;
        !this._addInputPosition && (this._addInputPosition = 0);
        this._input.pos = this._addInputPosition;
        if (data) {
            if (typeof (data) == 'string') {
                this._input.writeUTFBytes(data);
            }
            else {
                this._input.writeArrayBuffer(data);
            }
            this._addInputPosition = this._input.pos;
            this._input.pos = pre;
        }
        this.event(Event.MESSAGE, data);
    }
    _onClose(e) {
        this._connected = false;
        this.event(Event.CLOSE, e);
    }
    _onError(e) {
        this.event(Event.ERROR, e);
    }
    send(data) {
        this._socket.send(data);
    }
    flush() {
        if (this._output && this._output.length > 0) {
            var evt;
            try {
                this._socket && this._socket.send(this._output.__getBuffer().slice(0, this._output.length));
            }
            catch (e) {
                evt = e;
            }
            this._output.endian = this.endian;
            this._output.clear();
            if (evt)
                this.event(Event.ERROR, evt);
        }
    }
}
Socket.LITTLE_ENDIAN = "littleEndian";
Socket.BIG_ENDIAN = "bigEndian";
