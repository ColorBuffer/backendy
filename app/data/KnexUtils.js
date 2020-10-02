
module.exports = function KnexUtils(knex) {

    function findOne(table, where) {
        return knex(table).where(where).limit(1).first()
    }

    function findLastOne(table, where) {
        return knex(table).where(where).limit(1).orderBy('id', 'desc').first()
    }

    function updateOne(table, updatedFields, where) {
        return knex(table).where(where).limit(1).update(updatedFields)
    }

    async function updateAndReturn(table, object, update) {
        await updateOne(table, update, {id: object.id}).then()
        return {...object, ...update}
    }

    function incrementOne(table, increments, where) {
        return knex(table).where(where).limit(1).increment(increments)
    }

    async function insertAndReturn(table, attributes) {
        let id = await knex.insert(attributes, 'id').into(table)
        return findOne(table, {id})
    }

    function deleteAll(table, where) {
        return knex(table).where(where).delete()
    }

    function deleteOne(table, where) {
        return knex(table).where(where).limit(1).delete()
    }

    async function countAll(table, where) {
        const count = await knex(table).where(where).count('id as count')
        return parseInt(count[0].count)
    }

    return {
        findOne,
        findLastOne,
        insertAndReturn,
        updateOne,
        updateAndReturn,
        incrementOne,
        deleteAll,
        deleteOne,
        countAll,
    }

}
