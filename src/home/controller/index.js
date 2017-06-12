'use strict';

import Base from './base.js';
import request from 'request';


const rank_name = "rank";
const utils_service = think.service("utils","home");




export default class extends Base {



    init(...args) {
        super.init(...args);
        this.utils_service = new utils_service();

    }

  async  __before(){



    }

  /**
   * index action
   * @return {Promise} []
   */
  async indexAction(){


     await this.utils_service.processip({ip:this.http.ip(),movie_id:1})

      return this.success();
  }





  configAction(){

    console.info( think.config("app").appid );

    return this.success();
  }


 async dbAction(){


    let list = await this.model("cinema").select();

    return this.success(list);

  }


  successAction(){

    return this.success();
  }

  failAction(){

    return this.fail("查询条件不存在");
  }








   async payAction(){
        let data = {}
       data.cm_id = 2;
       data.openid = "o-XkY0VEjjhcY-8PQQcAobZA0Ksg";
       let result = await this.order_service.buy(data);
       return this.success()
   }





}