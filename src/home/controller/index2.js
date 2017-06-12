'use strict';

import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    //auto render template file index_index.html
    return this.display();
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

}