import { Handler } from "laya/utils/Handler";
import { Laya } from "Laya";

export function delay(duration:number) {
    return new Promise(resolve=>{
        setTimeout(function(){
            resolve();
        }, duration)
    });
};


export function loadRes(url:string){
    return new Promise(resolve=>{
        Laya.loader.load(url, Handler.create(null,()=>{
            resolve();}));
    });
}

export function download(url:string, data:any|null=null) {
  // Default options are marked with *
  return fetch(url/*,{
    body: JSON.stringify(data), // must match 'Content-Type' header
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      'user-agent': 'Mozilla/4.0 MDN Example',
      'content-type': 'application/json'
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // *client, no-referrer
  }*/)
  .then(response => response.json()) // parses response to JSON
}