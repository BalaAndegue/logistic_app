import { Injectable } from '@angular/core';
import * as Rx from "rxjs"




@Injectable({
  providedIn: 'root'
})


export class WebSocketService {

  constructor() { }
  private subject!:Rx.Subject<any>;
  public connect(url:string):Rx.Subject<any>{
    if(!this.subject){
      this.subject=this.create(url);
      console.log("successfuly connected"+url);

    }
    return this.subject;
  }
  private create(url:string):Rx.Subject<any>{
    let ws=new WebSocket(url);
    let observable=Rx.Observable.create(
      (obs:Rx.Observer<any>)=>{
        ws.onmessage=obs.next.bind(obs);
        ws.onerror=obs.error.bind(obs);
        ws.onclose=obs.complete.bind(obs);
        return ws.close.bind(ws);
      }
    )

    let observer={
      next:(data:Object)=>{
        if(ws.readyState==WebSocket.OPEN){
          ws.send(JSON.stringify(data))
        } else {
      ws.onopen = () => ws.send(JSON.stringify(data)); 
    }
      }
    }

    return Rx.Subject.create(observer,observable);
  }
}
