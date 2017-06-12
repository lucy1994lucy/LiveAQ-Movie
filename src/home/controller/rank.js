'use strict';

import Base from './base.js';

const rank_name = "movie_rank"

const rank_service = think.service("rank","home");

/**
 * 排行榜模块
 */
export default class extends Base {

    async init(...args) {
        super.init(...args);
        this.rank_service = new rank_service();


    }

    async __before(){

        //let token = this.post("token") || this.get("token");
        //let user = await this.model("user").where({token:token}).find();
        //if(think.isEmpty(user)) return;
        //
        //this.openid= user.openid;
        //this.nickname = new Buffer(user.nickname ,"UTF-8").toString() ;
        //this.head_img = user.head_img;

    }



    /**
     * 查询排行榜列表接口
     */
    async rankAction(){

            let list_str = await redis.zrevrange(rank_name , 0,-1);
            think.log(list_str)
            return this.success(list_str)

    }




    //TODO  生成测试数据接口
    async addrankAction(){


        let id = this.get("movie_id")
        let result = await this.rank_service.save_to_rank(id)

        return this.success(result)

    }



}
