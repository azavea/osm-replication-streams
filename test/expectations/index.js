const emptyRelation = require('./empty-relation');
const nodeCreated = require('./node-created');
const nodeDeleted = require('./node-deleted');
const nodeModified = require('./node-modified');
const relationCreated = require('./relation-created');
const relationDeleted = require('./relation-deleted');
const relationModified = require('./relation-modified');
const wayCreated = require('./way-created');
const wayDeleted = require('./way-deleted');
const wayModified = require('./way-modified');

module.exports = {
  emptyRelation,
  nodeCreated,
  nodeModified,
  nodeDeleted,
  relationCreated,
  relationDeleted,
  relationModified,
  wayCreated,
  wayDeleted,
  wayModified,
};
