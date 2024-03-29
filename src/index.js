import KnexStorage from 'express-knex-storage'
import Knex from 'knex'

export default (app) => {
  const knexStorage = KnexStorage(app)

  const aStorage = {
    db: {},
    name: 'KNEX-SQLite',
    processBeforeSaveToStorage: knexStorage.processBeforeSaveToStorage,
    processAfterLoadFromStorage: knexStorage.processAfterLoadFromStorage,
    mapPropToKnexTable: (prop, table) => {
      switch (prop.type) {
        case 'id':
          table.string(prop.name, 36)
          break
        case 'email':
          table.string(prop.name)
          break
        case 'text':
          table.string(prop.name)
          break
        case 'password':
          table.string(prop.name)
          break
        case 'ref':
          table.string(prop.name, 36)
          break
        case 'refs':
          table.string(prop.name, 255)
          break
        case 'datetime':
          table.datetime(prop.name)
          break
        case 'boolean':
          table.boolean(prop.name)
          break
        case 'enum':
          table.integer(prop.name, 1)
          break
        case 'decimal':
          table.decimal(prop.name, prop.precision || 8, prop.scale || 2)
          break
        case 'float':
          table.float(prop.name, prop.precision || 8, prop.scale || 2)
          break
        default:
          throw new Error(`invalid prop.type ${prop.type} for ${prop.name}`)
      }
    },

    initStorage: () => {
      // console.log('KNEX driver')
      let debug = false
      if (process.env.NODE_ENV === 'test' || process.env.DEBUG) debug = false
      return Promise.resolve()
        .then(() => Knex(
          {
            client: 'sqlite3',
            connection: {
              filename: app.env.KNEX_STORAGE_URL
            },
            useNullAsDefault: true,
            debug
          }
        ))
        .then((db) => {
          aStorage.db = db
          return app
        })
        .catch((err) => { throw err })
    },

    closeStorage: () => {
      // console.log('KNEX - close')
      return Promise.resolve()
        .then(() => app.storage.db.migrate.latest())
        .then(() => {
          app.storage.db.destroy()
          app.storage.db = null
        })
    },
    init: knexStorage.init,
    findById: knexStorage.findById,
    findOne: knexStorage.findOne,
    findAll: knexStorage.findAll,
    count: knexStorage.count,
    removeById: knexStorage.removeById,
    removeAll: knexStorage.removeAll,
    clearData: knexStorage.clearData,
    create: knexStorage.create,
    update: knexStorage.update
  }

  return aStorage
}
