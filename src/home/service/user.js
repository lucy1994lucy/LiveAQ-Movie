'use strict';
import moment from 'moment';
import request from 'request';

const utils_service = think.service("utils","home");


export default class extends think.service.base {

    init(...args){
        super.init(...args);
        this.utils_service = new utils_service();
    }


    /**
     * 用户登录接口
     * @param param
     */
    async login(param){

        let result =  await this.utils_service.get_user_openid(param);
        let obj =   JSON.parse(result);
        let stored = await this.model("user").where({openid:obj.openid}).find();

        //若无，则是新用户更，生成token，组装用户信息保存数据库，并返回token给前端
        let token = think.uuid(128);
        if(think.isEmpty(stored)){

            let user = {};
            user.head_img = param.head_img;
            user.nickname = param.nickname;
            user.openid = obj.openid;
            user.create_time = moment().format();
            user.token = token;
            let raw = await this.model("user").add(user);
            think.log(raw)

            //若有，则生成token，更新本地并返回给前端
        }else{

            let update_raws =  await this.model("user").where({openid:obj.openid}).update({token:token})
            think.log(update_raws)
        }

        return token;
    }




}






