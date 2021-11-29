axios = require('axios')
fsx = require('fs-extra')

function download() {
  const url = 'https://d41.gdl.netease.com/DownloaderStandalone.exe'
  const file = 'C:\\Netease\\超激斗梦境（NGP游戏平台）\\cache\\jt\\DownloaderStandalone2.exe'
  // const file = 'G:\\CJDMJ\\NGP\\cache\\jt\\DownloaderStandalone2.exe'
  const writer = fsx.createWriteStream(file + '.tmp')
  return new Promise(async (resolve, reject) => {
    return axios
      .get(url, {
        responseType: 'stream',
        ...{}
      })
      .then((res) => {
        res.data.pipe(writer)
        writer.on('finish', () => {
          console.error('----------- finish')
          resolve()
        })
        writer.on('error', () => {
          console.error('----------->>>>>>> error')
          reject()
        })
      })
      .catch(reject)
  })
    .then(() => fsx.rename(file + '.tmp', file))
    .finally(() => writer.close())
}
download()
