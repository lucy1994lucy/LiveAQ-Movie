'use strict';

import Base from './base.js';
import moment from 'moment';

const user_service = think.service("user","home");


/**
 * 用户模块
 */
export default class extends Base {

    init(...args) {
        super.init(...args);
        this.user_service = new user_service();

    }

    /**
     * 登录接口：小程序无token条件下
     * 1、根据code去获取微信openid
     * 2、根据openid查询本地有没存储用户信息
     * 3、若有，则生成token，更新本地并返回给前端
     * 4、若无，则是新用户更，生成token，组装用户信息保存数据库，并返回token给前端
     *
     * @param nickname 用户名
     * @param head_img 头像
     * @param code 状态码
     */
    async loginAction(){

        let nickname = this.get("nickname");
        let head_img = this.get("head_img");
        let code = this.get("code");

        let param = {};
        param.nickname = nickname;
        param.head_img = head_img;
        param.code = code;
        let result = await this.user_service.login(param);
        return this.success(result);

    }


    /**
     * 绑定用户信息接口
     * @param
     */
    async bindinfoAction(){

        let token = this.post("token");
        let phone = this.post("phone");
        let age = this.post("age");
        let result = await this.model("user").where({token:token}).update({phone:phone, age:age})
        return this.success(result);


    }

    /**
     * 查询用户信息接口
     * @param token 登录凭证
     */
    async queryAction(){
        let token = this.post("token");
        let result = await this.model("user").where({token:token}).find();
        let nickname  = new Buffer(result.nickname,'UTF-8').toString();
        result.nickname = nickname;
        return this.success(result);


    }


}
