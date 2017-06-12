'use strict';
import moment from 'moment';
const utils_service = think.service("utils","home");
const rank_service = think.service("rank","home");

//支付相关配置
const pay = think.config('pay')
/**
 * 订单业务逻辑处理类
 */
export default class extends think.service.base {


    init(...args){
        super.init(...args);
        this.utils_service = new utils_service();
        this.rank_service = new rank_service();

    }


    /**
     * 购买电影票
     */
    async buy(data){


        //根据影院场次id,查询电影相关信息
        let movie =  await this.model("cinema_movie").where( {id:data.cm_id} ).find();

        let movie_detail = await this.model("movie").where({id:movie.movie_id}).find();
        //根据openid查询用户信息
        let user = await this.model("user").where( {openid:data.openid} ).find();
        console.info(movie_detail)
        //生成订单，补全数据，存储数据库
        let order  = {};

        order.phone = user.phone;
        order.openid = data.openid;
        order.state = 0;
        order.create_time = moment().format('YYYY-MM-DD HH:mm:ss');
        order.total_fee = movie.price;
        order.nickname = user.nickname;
        order.head_img = user.head_img;
        order.code = "";    //支付回调生成兑换码
        order.cinema_id = movie.cinema_id;
        order.movie_id = movie.movie_id;
        order.times = movie.times;
        order.movie_title = movie_detail.title ;
        order.movie_img = movie_detail.img;
        //生成商家自定义编号
        order.out_trade_no = this.utils_service.get_out_trade_no();

        //保存到数据库
        let order_id = await this.model("movie_order").add(order);

        //调用微信支付，生成签名
       let pay_param = await this.utils_service.unifiedorder( {body:order_id, total_fee:order.total_fee, openid:order.openid, out_trade_no:order.out_trade_no} );

        return pay_param;
    }


    /**
     * 微信支付回调，更新订单状态
     */
   async callback_update( pay_result ){

        //更新订单状态
        if(pay_result.return_code[0]==="SUCCESS"){
            //支付成功
            let out_trade_no = pay_result.out_trade_no[0];  //商户订单号
            let total_fee = pay_result.total_fee[0];        //支付金额
            let mch_id = pay_result.mch_id[0];               //商户号
            let transaction_id = pay_result.transaction_id[0];//微信支付订单号

            //根据商户订单号查询订单,state状态为0
            let order = await this.model("movie_order").where({out_trade_no: out_trade_no, state:0}).find();

            if( !think.isEmpty(order) ){

                //商户号匹配
                if( mch_id === pay.mch_id){
                    //生成兑换码
                    let code =  this.utils_service.get_random_num(6);

                    //放入redis缓存，用于热门电影
                    await this.rank_service.save_to_rank(order.movie_id)



                    //更新订单状态
                   await this.model("movie_order").where({out_trade_no:order.out_trade_no, state:0 }).update( {state:1, code:code, notify_time:moment().format('YYYY-MM-DD HH:mm:ss') } );
                   return true;
                }
            }
        }
        return false;
    }







}






