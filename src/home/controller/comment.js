'use strict';

import Base from './base.js';
import moment from 'moment';



/**
 * 评论模块
 */
export default class extends Base {

    async init(...args) {
        super.init(...args);

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
     * 新增评论
     * @param movie_id
     * @param content
     * @param score
     * @param order_id
     * @param
     */
    async addAction(){

        let data = this.post();
        think.log(data);

        //查询订单是否被评论过
        let result = await this.model("comment").where({order_id:data.order_id}).find();

        //新增方法
        let movie = await this.model("movie_order").where({id:data.order_id}).find();



        if(think.isEmpty(result)){

            let comment = {};
            comment.openid = this.openid;
            comment.nickname = this.nickname;
            comment.head_img = this.head_img;

            comment.movie_id = movie.movie_id;
            comment.create_time = moment().format('YYYY-MM-DD HH:mm:ss');
            comment.content = data.content;
            comment.score = data.score;
            comment.order_id = data.order_id;
            let insert_id = await this.model("comment").add(comment);
            comment.id = insert_id;



            //评论成功修改订单状态 订单页面 TODO
             this.model("movie_order").where({id:data.order_id}).update({state:3})
            return this.success(comment);
        }



        return this.fail();

    }




    /**
     * 根据电影id查询评论列表  TODO 迁移到movie.js
     * 不做分页，查询前15条评论
     */
    async querylistAction(){

        let movie_id = this.get("movie_id");

        let list = await this.model("comment").where({movie_id:movie_id}).order("create_time desc").limit(15).select();

        for(let comment of list){

            if(!think.isEmpty(comment.nickname)) {
                comment.nickname = new Buffer(comment.nickname,"UTF-8").toString();
                think.log(comment.nickname)

            }

        }

        return this.success(list);
    }


}
