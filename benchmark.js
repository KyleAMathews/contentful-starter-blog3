const contentful = require(`contentful-management`)
const pMap = require(`p-map`)
const _ = require(`lodash`)
const fs = require(`fs`)
const path = require(`path`)

async function setupSpace() {
  const client = contentful.createClient({
    accessToken: process.env.ACCESS_TOKEN,
  })

  const space = await client.getSpace(process.env.SPACE_ID)
  return space
}

async function createEntry(environment, entryId) {
  const entry = await environment.createEntryWithId(`blogPost`, `${entryId}`, {
    fields: {
      title: {
        "en-US": `Auto generated posts ${entryId}`,
      },
      description: {
        "en-US": `Auto generated posts ${entryId}`,
      },
      publishDate: {
        "en-US": new Date(),
      },
      slug: {
        "en-US": `sup-${entryId}`,
      },
      body: {
        "en-US": `very long text indeed!`,
      },
    },
  })
  await entry.publish()
}

async function main() {
  const command = process.argv[2]
  const space = await setupSpace()

  if (command === `setup`) {
    console.log(`add 100 blog post entries`)

    const environment = await space.getEnvironment(`master`)
    pMap(
      _.range(100),
      async (entryId) => {
        await createEntry(environment, entryId)
        console.log(`created`, entryId)
      },
      { concurrency: 1 }
    )
  } else if (command === `increment`) {
    // Update an entry
    const entryId = _.random(0, 99, false)
    console.log({ entryId })
    const environment = await space.getEnvironment(`master`)

    try {
      let entry = await environment.getEntry(entryId)
      entry.fields.body[`en-US`] = Math.random().toString()
      entry = await entry.update()
      await entry.publish()
    } catch (e) {
      console.log(`error when updating ${entryId}`, e)
      throw e
    }
    console.log(`published update`)

    let toDeleteCreate
    const toDeleteCreatePath = path.join(__dirname, `to-delete-create.json`)
    if (fs.existsSync(toDeleteCreatePath)) {
      toDeleteCreate = JSON.parse(fs.readFileSync(toDeleteCreatePath))
    }

    if (toDeleteCreate) {
      const { deleteId, createId } = toDeleteCreate

      let deleteEntry = await environment.getEntry(deleteId)
      deleteEntry = await deleteEntry.unpublish()
      await deleteEntry.delete()

      await createEntry(environment, createId)
      fs.writeFileSync(
        toDeleteCreatePath,
        JSON.stringify({ deleteId: createId, createId: deleteId })
      )
    } else {
      await createEntry(environment, `100`)
      fs.writeFileSync(
        toDeleteCreatePath,
        JSON.stringify({ deleteId: `100`, createId: `101` })
      )
    }
  }
}

main()
