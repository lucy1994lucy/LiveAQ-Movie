'use strict';

import Base from './base.js';
const pay = think.config('pay')
const app = think.config('app')
const utils_service = think.service("utils","home");
const order_service = think.service("order","home");


/**
 * 订单模块
 */
export default class extends Base {

  init(...args) {
    super.init(...args);
    this.utils_service = new utils_service();
    this.order_service = new order_service();
  }





  async __before(){

    let token = this.post("token") || this.get("token");
    let user = await this.model("user").where({token:token}).find();
    if(think.isEmpty(user)) return;

    this.openid= user.openid;
    this.nickname = new Buffer(user.nickname ,"UTF-8").toString() ;
    this.head_img = user.head_img;

  }






  /**
   * 下单接口
   * @param movie_id 电影id
   * @param cinema_id 影院id
   * @param times 场次
   * @param openid 用户openid,从登录token中获取
   *
   * @return 支付参数
   */
  async buyAction(){


    let data = this.post();
    data.openid = this.openid;
    let result = await this.order_service.buy(data);
    return this.success(result)

  }







  /**
   * 已支付订单列表
   * @param page
   * @param page_size
   */
  async listAction( page=1, page_size=10 ){

    let openid = this.openid;

    let sqlResult = await this.model("movie_order").where( {openid:openid, state:{">=":1}}).order("create_time desc").page((page-1)*page_size,page_size).countSelect();

    //格式化数据

    let final_result = {}
    final_result.total = sqlResult.count;
    final_result.page = sqlResult.currentPage;
    final_result.pageSize = sqlResult.numsPerPage;
    final_result.pageData = sqlResult.data;

    return this.success(final_result);


  }















  /**
   * 查询订单详情
   * @param id 订单主键
   */
  async queryAction(){


    let openid = this.openid;
    let id = this.get("id");

    let sql ='select o.id order_id,o.phone phone,o.out_trade_no out_trade_no,'+
    'o.create_time create_time,o.total_fee total_fee, o.code code,m.title title,' +
    'm.img movie_img,m.summary summary, c.name cinema_name,c.address address '+
    'from movie_order o left join movie m on o.movie_id=m.id left join cinema c on o.cinema_id=c.id  where o.id=%d';

    let final_sql =  this.model("movie_order").parseSql(sql,id);
    let result =  await this.model("movie_order").query(final_sql)

    return this.success(result[0])

  }





















  /**
   * index action
   *
   * 统一下单接口,返回对应的xml数据
   * @param body 商品描述
   * @param total_fee 支付金额 单位分
   * @param notify_url 回调url，支付通知
   * @param openid 用户的openid
   * @param out_trade_no 订单唯一编号
   */

  async indexAction(){

    let param = {};

    param.body = "buy ticket";
    param.total_fee = 10;
    param.notify_url = "wwww.baidu.com";
    param.openid = "o-XkY0VEjjhcY-8PQQcAobZA0Ksg";
    param.out_trade_no = super.get_out_trade_no();

    let result = await this.utils_service.unifiedorder(param);

    return this.success(result);

  }



  /**
   * index action
   * @return {Promise} []
   */
  async openidAction(){

    console.info("【code】");
    console.info(this.get("code"))
    let param = {code: this.get("code")};
   let result =  await this.utils_service.get_user_openid(param);
    return this.success(result);

  }







  /**
   * 下单接口  TODO 淘宝ip地址库访问
   * @param movie_id 电影id
   * @param cinema_id 影院id
   * @param times 场次
   * @param openid 用户openid,从登录token中获取
   *
   * @return 支付参数
   */
  //async buyAction(){
  //
  //
  //  await this.utils_service.processip({ip:this.http.ip(),movie_id:this.post("movie_id")})
  //
  //  let data = this.post();
  //  data.openid = this.openid;
  //  let resutlt =  await this.order_service.buy(data)
  //  return this.success(resutlt);
  //}

}