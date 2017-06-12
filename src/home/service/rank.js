'use strict';
import moment from 'moment';
import request from 'request';


const rank_name = "movie_rank"
/**
 * 排行榜模块
 */
export default class extends think.service.base {

    init(...args){
        super.init(...args);


    }



    /**
     *  插入排行榜，若无则新增
     * @returns {Promise|void|think.PreventPromise}
     */
    async save_to_rank( movie_id ){

        let movie = await this.model("movie").where({id:movie_id}).find();

        let obj = {}
        obj.movie_id = movie.id;
        obj.title = movie.title;
        obj.img = movie.img;
        obj.score = movie.score;

        //添加两个字段
        obj.watch_count = movie.watch_count;
        obj.show_time = moment(movie.show_time).format('YYYY-MM-DD HH:mm:ss') ;
        let result = await redis.zincrby( rank_name, 1 ,JSON.stringify(obj) );

        return result;

    }




}






