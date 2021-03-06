const Sequelize = require('sequelize')
const env = require('../utils/env')
const logger = require('../utils/logger')

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    dialect: 'postgres',
    logging: false
})

class Paper {
    constructor() {
        this.model = sequelize.define('Paper', {
            eid: {
                type: Sequelize.STRING,
                primaryKey: true,
                unique: true
            },
            base: Sequelize.STRING,
            topic: Sequelize.TEXT,
            type: Sequelize.STRING,
            doi: Sequelize.STRING,
            duplicate: Sequelize.STRING,
            percent: Sequelize.INTEGER,
            journal: Sequelize.TEXT,
            issn: Sequelize.STRING,
            volume: Sequelize.STRING,
            issue: Sequelize.STRING,
            pages: Sequelize.STRING,
            author: Sequelize.TEXT,
            ourAuthors: Sequelize.TEXT,
            ourAuthorsId: Sequelize.ARRAY(Sequelize.INTEGER),
            affil: Sequelize.TEXT,
            year: Sequelize.STRING,
            frezee: Sequelize.BOOLEAN,
            new: Sequelize.BOOLEAN
        }, {
            freezeTableName: true
        })
        this.model.removeAttribute('id')
    }
    sync() {
        try {
            return this.model.sync()
        } catch (err) {
            console.log(err.message)
        }
    }
    async count(year, base, newId) {
        try {
            if (!newId) {
                let counter = await this.model.findAll({
                    attributes: [
                        [sequelize.fn('COUNT', sequelize.col('year')), 'count']
                    ],
                    where: {
                        year: year,
                        base: base
                    },
                    raw: true,
                })
                return Number(counter[0]['count'])
            } else {
                let counter = await this.model.findAll({
                    attributes: [
                        [sequelize.fn('COUNT', sequelize.col('year')), 'count']
                    ],
                    where: {
                        year: year,
                        base: base,
                        new: true
                    },
                    raw: true,
                })
                return Number(counter[0]['count'])
            }
            
        } catch (err) {
            console.log(err)
        }
    }
    async save(data) {
        try {
            await this.model.create(data)
            //logger(`Paper with id: ${data.eid} is written to the database!`)
        } catch (err) {
            console.log(err)
        }
    }
    async idList(base) {
        try {
            let existId = await this.model.findAll({
                attributes: ['eid'],
                where: {
                    base: base
                },
                raw: true,
            })
            
            let data = new Map()

            for (let i in existId) data.set(existId[i].eid, true)
            
            return data
        } catch (err) {
            console.log(err.message)
        }
    }
    async topicList(base) {
        try {
            let existTopics = await this.model.findAll({
                attributes: ['eid', 'topic'],
                where: {
                    base: base
                },
                raw: true,
            })
            
            let data = new Map()

            for (let i in existTopics) data.set(existTopics[i].topic, existTopics[i].eid)
            
            return data
        } catch (err) {
            console.log(err.message)
        }
    }
    async writeNew() {
        try {
            await this.model.update({ new: false }, {
                where: {
                    new: true
                }
            })

            return true
        } catch (err) {
            console.log(err.message)
        }
    }
    async resetNew() {
        try {
            await this.model.destroy({
                where: {
                  new: true
                }
            })

            return true
        } catch (err) {
            console.log(err.message)
        }
    }
    async findOne(eid) {
        try {
            let data = await this.model.findOne({
                where: {
                    eid: eid
                },
                raw: true
            })
            
            return data
        } catch (err) {
            console.log(err.message)
        }
    }
    async update(data) {
        try {
            await this.model.update(data, {
                where: {
                    eid: data.eid
                }
            })
            
            console.log('Paper updated!')
            
            return
        } catch (err) {
            console.log(err.message)
        }
    }
    async delete(id) {
        try {
            await this.model.destroy({
                where: {
                    eid: id
                }
            })
            
            console.log('Paper deleted!')
            
            return
        } catch (err) {
            console.log(err.message)
        }
    }
    async export() {
        try {
            let data = await this.model.findAll({
                where: {
                    new: true
                },
                raw: true
            })
            
            return data
        } catch (err) {
            console.log(err.message)
        }
    }
}

exports.Paper = Paper