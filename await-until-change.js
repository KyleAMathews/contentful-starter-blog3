const got = require(`got`)

async function awaitUntilChange(url) {
  let changed = false
  let start = new Date().getTime()
  const ogBody = await got.get(url).then((og) => og.body)

  const interval = setInterval(() => {
    console.log(`still checking ${url}`)
  }, 1000)

  while (!changed) {
    const newBody = await got.get(url).then((nb) => nb.body)
    if (ogBody !== newBody) {
      changed = true
      clearInterval(interval)
    }
  }

  console.log(`done`)
  const end = new Date().getTime()

  console.log(end - start)
}

module.exports = awaitUntilChange

// awaitUntilChange(`https://www.gatsbyjs.com/page-data/index/page-data.json`)
