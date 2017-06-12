'use strict';
/**
 * config
 */
export default {

    //小程序相关配置，如appId等
    app:{
        appid:"wxf5dc9ad2df67d5fa",
        secret:"0fbcdff794d1899abe4e45f852132b95"
    },


    //支付相关配置，秘钥等
    pay:{
        mch_id : "1408341602",  //商户号
        key : "6d0f990197a91864332183ea48666630"  //api秘钥

    },

    //服务器基本信息
    server:{
        domain:"http://16web.tunnel.qydev.com",
        callback:"/home/callback/update", //支付回调接口
        ip : "120.25.1.38"
    }
};