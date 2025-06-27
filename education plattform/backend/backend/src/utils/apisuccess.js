class ApiSuccess {
    constructor(statusCode, message, data = null, meta = null, links = null) {
      this.statusCode = statusCode;
      this.status = 'success'; 
      this.message = message;
      this.data = data;
      this.meta = meta;
      this.links = links;
    }
  
    send(res) {
      return res.status(this.statusCode).json({
        status: this.status,
        statusCode: this.statusCode,
        message: this.message,
        data: this.data,
        meta: this.meta,
        links: this.links
      });
    }
  }
  
  module.exports = ApiSuccess;