'use strict';

import Base from './base.js';

const rank_name = "movie_rank"



/**
 * 数据模块
 */
export default class extends Base {

    async init(...args) {
        super.init(...args);

    }





    /**
     * 统计哪个城市最多人看电影
     */
    async queryAction(){


        let final_sql = "select count(*) num,d.city,d.movie_id,m.title from data d left join movie m on d.movie_id=m.id  group by city order by num";

        let result =  await this.model("data").query(final_sql)

        return this.success(result);

    }


}
