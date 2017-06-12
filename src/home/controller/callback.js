'use strict';

import Base from './base.js';
import xml2js from 'xml2js';
const order_service = think.service("order","home");
//TODO 引进类
const rank_service = think.service("rank","home");
/**
 * 微信回调模块
 */
export default class extends Base {


    init(...args){
        super.init(...args);
        this.parser = new xml2js.Parser();   // parser.parseString(xml) xml -> json
        this.order_service = new order_service();

    }


    /**
     * 微信支付回调通知方法，更新订单状态
     *
     */
  async  updateAction(){

      let post_data = await this.http.getPayload();
      think.log("[wechat pay callback]")

      let callback = {};
      //解析xml->json
      this.parser.parseString( post_data,(err, re)=>{ callback = re; } );

      let pay_result = callback.xml;

      //打印支付回调结果
      think.log(pay_result);




      let update_flag = await this.order_service.callback_update( pay_result );
      let msg = update_flag ? "success" : "fail";

      //响应字符串给微信
      think.log("[wechat pay callback update result=]"+msg)
      this.send(msg);


  }






}