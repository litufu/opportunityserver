const _ = require('lodash');

const parseDate = (date) => {
    // 将20120202字符串转换为日期格式
    const year = parseInt(date.slice(0,4))
    const month = parseInt(date.slice(4,6))
    const day = parseInt(date.slice(6,8))
    const d = new Date(year,month-1,day)
    return d
  }

const parseSinaStock = (daily)=>{
  const stocks = _.split(daily, "\n");
  const result = []
  for(const stockInfo of stocks){
    let stock = _.replace(stockInfo,"var","")
    stock = _.trim(stock)
    const stockFormula = _.split(stock,'=')
    if(stockFormula.length==2){
      const stockSymbol = stockFormula[0]
      const symbol = stockSymbol.slice(-6,)
      let stockData = _.replace(stockFormula[1],';','')
      stockData = _.replace(stockFormula[1],'"','')
      stockprices = _.split(stockData,",")
      const open = parseFloat(stockprices[1]) 
      const preClose = parseFloat(stockprices[2])
      const close = parseFloat(stockprices[3])
      const high = parseFloat(stockprices[4])
      const low = parseFloat(stockprices[5])
      const vol = parseInt(stockprices[8])/100
      const amount = parseInt(stockprices[9])/10000
      const res = {
        symbol,
        open,
        preClose,
        close,
        high,
        low,
        vol,
        amount
      }
      result.push(res)
    }
  }
  return result
}

const getToday = ()=>{
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  return new Date(year,month,day)
}

const getBeforeDate = (nowday,n)=>{
	const d = new Date(nowday);
	let year = d.getFullYear();
	let mon = d.getMonth() + 1;
	let day = d.getDate();
	if(day <= n) {
	    if(mon > 1) {
	        mon = mon - 1;
	    } else {
	        year = year - 1;
	        mon = 12;
	    }
	}
	d.setDate(d.getDate() - n);
	year = d.getFullYear();
	mon = d.getMonth() + 1;
	day = d.getDate();

  return new Date(year,mon-1,day)
}

const getBottomPct = (daily)=>{
  const open = daily.open
  const high = daily.high
  const low = daily.low
  const close = daily.close
  const whole = high - low
  let bottom
  if(open>close){
    bottom = close - low
  } else{
    bottom = open - low
  }
  const bottomPct = bottom / whole
  return bottomPct
}

const getChangePct=(daily,beforeDailies)=>{
  const close = daily.close
  const befores = beforeDailies.filter(d=>d.symbol===daily.symbol)
  if(befores.length>0){
    const beforeClose = befores[0].close
    const changePct = (beforeClose - close ) /close
    return changePct
  }else{
    return 0.00
  }
  
}
  
  module.exports = {
    parseDate,
    parseSinaStock,
    getToday,
    getBeforeDate,
    getBottomPct,
    getChangePct
  }