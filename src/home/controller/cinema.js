'use strict';

import Base from './base.js';

/**
 * 影院模块
 */
export default class extends Base {


    /**
     * 查询影院列表和场次信息
     */
    async queryAction(){
        let movie_id = this.get("movie_id");

        let sql = "select c.name,c.score,c.address, cm.id cm_id ,cm.movie_id,DATE_FORMAT(cm.play_time, '%Y-%m-%d %H:%m') play_time,cm.price"+
       " from cinema c left join cinema_movie cm on c.id = cm.cinema_id where cm.movie_id = "+movie_id+" order by play_time desc,c.id";

        let result = await this.model("cinema_movie").query(sql);
        return  this.success(result)

    }


}