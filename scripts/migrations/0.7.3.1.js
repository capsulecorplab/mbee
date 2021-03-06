/**
 * @classification UNCLASSIFIED
 *
 * @module scripts.migrations.0.7.3.1
 *
 * @copyright Copyright (C) 2018, Lockheed Martin Corporation
 *
 * @license MIT
 *
 * @owner Austin Bieber
 *
 * @author Austin Bieber
 *
 * @description Migration script for version 0.7.3.1. Adds the field
 * 'projectReferences' to all existing projects.
 */

// Node modules
const fs = require('fs');
const path = require('path');

// MBEE modules
const Project = M.require('models.project');
const migrate = M.require('lib.migrate');

/**
 * @description Handles the database migration from 0.7.3.1 to 0.7.3.
 *
 * @returns {Promise} Returns an empty promise upon completion.
 */
module.exports.down = async function() {
  return migrate.shiftVersion('0.7.3');
};

/**
 * @description Handles the database migration from 0.7.3 to 0.7.3.1.
 * Adds the field 'projectReferences' to each existing project.
 *
 * @returns {Promise} Returns an empty promise upon completion.
 */
module.exports.up = async function() {
  await projectHelper();
  return migrate.shiftVersion('0.7.3.1');
};

/**
 * @description Helper function for 0.7.3 to 0.7.3.1 migration. Handles all
 * updates to the project collection.
 *
 * @returns {Promise} Returns an empty promise upon completion.
 */
function projectHelper() {
  return new Promise((resolve, reject) => {
    let projects = [];

    // If data directory doesn't exist, create it
    if (!fs.existsSync(path.join(M.root, 'data'))) {
      fs.mkdirSync(path.join(M.root, 'data'));
    }

    // Find all projects
    Project.find({})
    .then((foundProjects) => {
      projects = foundProjects;

      // Write contents to temporary file
      fs.writeFileSync(path.join(M.root, 'data', 'projects-0731.json'), JSON.stringify(projects));
    })
    // Add the projectReferences field to each project
    .then(() => Project.updateMany({}, { projectReferences: [] }))
    .then(() => {
      if (fs.existsSync(path.join(M.root, 'data', 'projects-0731.json'))) {
        fs.unlinkSync(path.join(M.root, 'data', 'projects-0731.json'));
      }
    })
    .then(() => resolve())
    .catch((error) => reject(error));
  });
}
