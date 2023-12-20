const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500

  res.status(statusCode)

  res.json({
    message: err.message,
    //from which line or file error is comming
    // this will be visiable only at dev time
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  })
}
module.exports = errorHandler
