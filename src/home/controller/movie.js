'use strict';

import Base from './base.js';
import moment from 'moment';


/**
 * 电影模块
 */
export default class extends Base {



    /**
     * 电影列表 分页
     * @param page 当前页
     * @param page_size 每页显示大小
     * @returns {接口数据}
     */
    async pageAction(page=1, size=5){

        page = this.get("page");
        size =this.get("size");

        think.log(page)
        think.log(size)
        let list =  await this.model("movie").page( page,size).order("show_time DESC").countSelect();
        return this.success(list)

    }


    /**
     *  电影名称搜索列表，返回10条数据,如果想更精确，就输入更多内容
     * @param size
     */
    async searchAction(){

        let size =this.get("size") || 10;
        let title = this.get("title");
        think.log(size)
        let resutl = await this.model("movie").where({title: ["like", "%"+title+"%"]}).order("show_time DESC").limit(size).select();
        return this.success(resutl);
    }





    /**
     * 根据电影id查看详情，和演员列表
     * @returns {Promise|void|think.PreventPromise}
     */
    async queryAction(){

        let movie_id = this.get("movie_id");
        let movie_detail = await this.model("movie").where( {id:movie_id} ).find();
        //关联表
        //查询演员列表
        let actor_id_list = await this.model("actor_movie").where( {movie_id:movie_id} ).select();
        let actor_id_arr = [];
        for(let o of actor_id_list){
            think.log(o.actor_id)
            actor_id_arr.push(o.actor_id)
        }
        //in查询
        let actor_list = await this.model("actor").where({id: ["IN", actor_id_arr]}).select();


        //评论列表
        let list = await this.model("comment").where({movie_id:movie_id}).order("create_time desc").limit(15).select();
        for(let comment of list){
            if(!think.isEmpty(comment.nickname)) {
                comment.nickname = new Buffer(comment.nickname,"UTF-8").toString();
                comment.create_time = moment(comment.create_time).format('YYYY-MM-DD HH:mm:ss')
                think.log(comment.nickname)
            }
        }

        let result = {};
        result.movie_detail = movie_detail;
        result.actor_list = actor_list;
        result.comment_list = list;
        return this.success(result);

    }




}