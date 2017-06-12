'use strict';
import moment from 'moment';
import request from 'request';
import xml2js from 'xml2js';

//小程序相关配置
const app = think.config('app')
//支付相关配置
const pay = think.config('pay')
//服务器信息
const server = think.config("server")






export default class extends think.service.base {

    init(...args){
        super.init(...args);
        this.parser = new xml2js.Parser();   // parser.parseString(xml) xml -> json

    }





    /**
     * 统一下单接口,返回对应的xml数据
     * @param body 商品描述
     * @param total_fee 支付金额 单位分
     * @param openid 用户的openid
     * @param out_trade_no 订单唯一编号
     */
    async unifiedorder(data) {


        think.log(data)

        //组装签名参数
        let param = {}
        param.appid = app.appid;
        param.mch_id = pay.mch_id;
        param.nonce_str = think.uuid().substring(0, 18);
        param.body = data.body;
        param.out_trade_no = data.out_trade_no;  //订单唯一编号
        param.total_fee = data.total_fee;
        param.spbill_create_ip = server.ip;
        param.notify_url = server.domain+server.callback;  //微信支付回调url
        param.trade_type = "JSAPI";
        param.openid = data.openid;


        //字典排序
        let stringA = this.sort_param(param);
        let stringSignTemp = `${stringA}&key=${pay.key}`;

        //MD5签名，并转换为大写
        let sign = think.md5(stringSignTemp).toUpperCase();

        think.log(`[param=${param}],[stringA=${stringA}],[stringSignTemp=${stringSignTemp}],[sign=${sign}]`);


        //统一下单url
        let unifiedorder_url = "https://api.mch.weixin.qq.com/pay/unifiedorder";

        //拼装xml
        let xmlData  = "<xml>";
        xmlData  += "<appid>"+param.appid+"</appid>";  //appid
        xmlData  += "<body>"+param.body+"</body>";
        xmlData  += "<mch_id>"+param.mch_id+"</mch_id>";  //商户号
        xmlData  += "<nonce_str>"+param.nonce_str+"</nonce_str>"; //随机字符串，不长于32位。
        xmlData  += "<notify_url>"+param.notify_url+"</notify_url>";
        xmlData  += "<openid>"+param.openid+"</openid>";
        xmlData  += "<out_trade_no>"+param.out_trade_no+"</out_trade_no>";
        xmlData  += "<spbill_create_ip>"+param.spbill_create_ip+"</spbill_create_ip>";
        xmlData  += "<total_fee>"+param.total_fee+"</total_fee>";
        xmlData  += "<trade_type>JSAPI</trade_type>";
        xmlData  += "<sign>"+sign+"</sign>";
        xmlData  += "</xml>";
        think.log("【拼装xml数据】")
        think.log(xmlData);

        let result =  await this.postwechat(unifiedorder_url,xmlData);
        think.log("【统一下单 请求结果】")
        think.log(result)

        let prepay_id = "";
        this.parser.parseString(result,(err, re)=>{
            think.log(re);
            prepay_id = re.xml.prepay_id;
        })
        think.log("【prepay_id=】"+prepay_id)


        //再次签名，调起支付
        let pay_param = this.sign_again({"package":"prepay_id="+prepay_id})
        think.log("【pay_param=】"+pay_param)

        return pay_param;

    }


    /**
     * 支付参数再次签名，返回小程序调用数据
     * @param package 统一下单里面的数据包 如 prepay_id=wderwdv
     */
    sign_again(data) {

        let param = {};
        param.appId = app.appid;    //注意大小写
        param.timeStamp = Date.now()+""; //需要为字符串
        param.nonceStr = think.uuid().substring(0, 18);
        param.package = data.package;  //数据包
        param.signType = "MD5";

        //排序签名
        let stringA = this.sort_param(param);
        let stringSignTemp = `${stringA}&key=${pay.key}`;
        //MD5签名，并转换为大写
        let sign = think.md5(stringSignTemp).toUpperCase();

        think.log(`[param=${param}],[stringA=${stringA}],[stringSignTemp=${stringSignTemp}],[sign=${sign}]`);


        //组装结果，返回给小程序调起支付
        param.sign = sign;

        return param;


    }









    /**
     * 获取用户隐私信息
     * @param code 凭证
     * @returns {*}
     */
    async get_user_openid(data){

        //通过code换取用户隐私信息
        let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${app.appid}&secret=${app.secret}&js_code=${data.code}&grant_type=authorization_code`;

        let result = await this.getwechat(url);
        think.log("【获取openid 请求结果】")
        think.log(result)
        return result;

    }













    /**
     * 将集合M内所有的参数（包含空的参数值）按照参数名ASCII码从小到大排序（字典序），使用URL键值对的格式
     * （即key1=value1&key2=value2…）拼接成字符串返回，(且key暂未统一转换为小写)
     * @param param json对象
     * @returns {string}
     */
    sort_param(param){
        let array = new Array();
        for(let obj in param){
            let map =  obj+"="+param[obj];
            array.push(map);
        }
        array =  array.sort();
        let result = "";
        for(let obj of array){
            result+=obj+"&"
        }
        result = result.substring(0,result.length-1);
        return result
    }


    /**
     * 生成商户订单号
     * @returns {string|*}
     */
    get_out_trade_no(){

        let orderNo = moment().format("YYYYMMDD");
        for (let i = 0; i < 10; i++) {
            orderNo = orderNo + Math.floor(Math.random() * 10);
        }
        return orderNo;
    }





    /**
     * post 数据提交
     * @param url
     * @param data
     * @returns {Promise}
     */
    postwechat(url, data) {
        console.log(url)
        return new Promise((resolve, reject) => {
            request.post({
                url: url,
                method:'POST',
                body: data

            }, function(e, r, body) {
                if (e) reject(e);
                resolve(body)
            })
        })
    }

    /**
     * get 数据提交
     * @param url
     * @returns {Promise}
     */
    getwechat(url, data) {
        console.log(url)
        return new Promise((resolve, reject) => {
            request.get({
                url: url,
                method:'GET'
            }, function(e, r, body) {
                if (e) reject(e);
                resolve(body)
            })
        })
    }


    /**
     * 生成随机数字
     * @param length 数字长度,默认长度为6
     * @returns {string}
     */
    get_random_num( length=6 ){
        let  code="";
        for(let i=0;i<length; i++)
        {
            code+=Math.floor(Math.random()*10);
        }
        return code;
    }











    /**
     * post 数据提交
     * @param url
     * @param data
     * @returns {Promise}
     */
    postJson(url, data) {
        console.log(url)
        return new Promise((resolve, reject) => {
            request.post({
                url: url,
                body: data,
                json: true
            }, function(e, r, body) {
                if (e) reject(e);
                resolve(body)
            })
        })
    }




    /**
     * get 请求
     * @param url 请求路径
     * @param param json对象，拼接到url上
     * @returns {Promise}
     */
    get(url,param) {
        //格式化添加token
        url+= url.indexOf('?')>-1?'':'?';
        let paramStr = "";
        if(!think.isEmpty(param)){
            for(let obj in param){
                paramStr += (obj + "=" + param[obj] + "&");
            }
        }
        paramStr =  paramStr.substring(0,paramStr.lastIndexOf("&")) ;

        url = url + paramStr;


        return new Promise((resolve, reject) => {
            request.get({
                url: url,
                json: true
            }, function(e, r, body) {
                // console.log(e,body);
                if (e) reject(e);
                resolve(body)
            })
        })
    }


    /**
     * 数据存储接口
     * @param param
     */
    async save_data(param){

        let data = {};
        data.ip = param.ip;
        data.city = param.city;
        data.province = param.province;
        data.movie_id = param.movie_id;

        let id = await this.model("data").add(data);
        data.id = id;
        return data;


    }


    /**
     * @param ip 访问ip
     * @param movie_id 电影id
     * @returns {*}
     */
    async processip( param ){


        let url = "http://ip.taobao.com/service/getIpInfo.php?ip="+param.ip;

        let result = await this.getwechat(url);

        let obj = JSON.parse(result);
        think.log(obj)
        if( obj.code == 0){

            let data = {};
            data.city = obj.data.city;
            data.province= obj.data.region;
            data.ip = param.ip;
            data.movie_id = param.movie_id;
            this.save_data(data);

        }

    }





}






