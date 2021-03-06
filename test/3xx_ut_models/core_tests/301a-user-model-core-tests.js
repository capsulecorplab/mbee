/**
 * @classification UNCLASSIFIED
 *
 * @module test.301a-user-model-core-tests
 *
 * @copyright Copyright (C) 2018, Lockheed Martin Corporation
 *
 * @license MIT
 *
 * @owner Connor Doyle
 *
 * @author Josh Kaplan
 * @author Leah De Laurell
 * @author Austin Bieber
 *
 * @description Tests the user model by performing various actions such as a
 * find, create, update, archive, and delete. Does NOT test the user
 * controller but instead directly manipulates data to check the user model
 * methods, validators, setters, and getters.
 */

// Node modules
const crypto = require('crypto');

// NPM modules
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

// Use async chai
chai.use(chaiAsPromised);
const should = chai.should(); // eslint-disable-line no-unused-vars

// MBEE modules
const User = M.require('models.user');
const db = M.require('lib.db');

/* --------------------( Test Data )-------------------- */
const testUtils = M.require('lib.test-utils');
const testData = testUtils.importTestData('test_data.json');

/* --------------------( Main )-------------------- */
/**
 * The "describe" function is provided by Mocha and provides a way of wrapping
 * or grouping several "it" tests into a single group. In this case, the name of
 * that group (the first parameter passed into describe) is derived from the
 * name of the current file.
 */
describe(M.getModuleName(module.filename), () => {
  /**
   * Before: runs before all tests. Open the database connection.
   */
  before((done) => {
    db.connect()
    .then(() => done())
    .catch((error) => {
      chai.expect(error.message).to.equal(null);
      done();
    });
  });

  /**
   * After: runs after all tests. Close database connection.
   */
  after((done) => {
    db.disconnect()
    .then(() => done())
    .catch((error) => {
      chai.expect(error.message).to.equal(null);
      done();
    });
  });

  /* Execute the tests */
  it('should create a user', createUser);
  it('should verify a valid password', verifyValidPassword);
  it('should get a user from the database', getUser);
  it('should get a users public data', getUserPublicData);
  it('should update a user', updateUser);
  it('should delete a user', deleteUser);
});

/* --------------------( Tests )-------------------- */
/**
 * @description Creates a user via model and save it to the database.
 */
async function createUser() {
  try {
    const userData = testData.users[1];
    userData._id = userData.username;
    // Create a hash of the password
    const derivedKey = crypto.pbkdf2Sync(userData.password, userData._id.toString(), 1000, 32, 'sha256');
    // Create a new User object
    const user = User.createDocument(userData);
    // Save user object to the database
    const savedUser = await user.save();
    // Ensure that the user password is stored as a hash
    savedUser.password.should.equal(derivedKey.toString('hex'));
  }
  catch (error) {
    M.log.error(error);
    // There should be no error
    should.not.exist(error);
  }
}

/**
 * @description Checks that the user from the previous createUser test was
 * created successfully and contains the expected data.
 */
async function getUser() {
  try {
    // Find the created user from the previous createUser test.
    const user = await User.findOne({ _id: testData.users[1].username });
    // Check first, last, and preferred name
    user.fname.should.equal(testData.users[1].fname);
    user.lname.should.equal(testData.users[1].lname);
    user.preferredName.should.equal(testData.users[1].preferredName);
  }
  catch (error) {
    M.log.error(error);
    // There should be no error
    should.not.exist(error);
  }
}

/**
 * @description Gets a users public data.
 */
async function getUserPublicData() {
  try {
    // Find the created user from the previous createUser test.
    const user = await User.findOne({ _id: testData.users[1].username });
    // Check first, last, and preferred name
    user.fname.should.equal(testData.users[1].fname);
    user.lname.should.equal(testData.users[1].lname);
    user.preferredName.should.equal(testData.users[1].preferredName);
  }
  catch (error) {
    M.log.error(error);
    // There should be no error
    should.not.exist(error);
  }
}

/**
 * @description Checks that a user password was properly stored and can be
 * authenticated.
 */
async function verifyValidPassword() {
  try {
    // Find the created user from the previous createUser test.
    const user = await User.findOne({ _id: testData.users[1].username });
    // Verify the user's password
    const result = await user.verifyPassword(testData.users[1].password);
    // expected - verifyPassword() returned true
    result.should.equal(true);
  }
  catch (error) {
    M.log.error(error);
    // There should be no error
    should.not.exist(error);
  }
}

/**
 * @description Updates the first and last name of the user previously created
 * in the createUser test.
 */
async function updateUser() {
  try {
    // Update the name of the user created in the createUser() test
    await User.updateOne({ _id: testData.users[1].username }, { fname: 'Updated' });

    // Find the updated user
    const foundUser = await User.findOne({ _id: testData.users[1].username });

    // Verify user is updated correctly
    foundUser._id.should.equal(testData.users[1].username);
    foundUser.fname.should.equal('Updated');
  }
  catch (error) {
    M.log.error(error);
    // There should be no error
    should.not.exist(error);
  }
}

/**
 * @description Delete a user.
 */
async function deleteUser() {
  try {
    // Remove the user
    await User.deleteMany({ _id: testData.users[1].username });

    // Attempt to find the user
    const foundUser = await User.findOne({ _id: testData.users[1].username });

    // foundUser should be null
    should.not.exist(foundUser);
  }
  catch (error) {
    M.log.error(error);
    // There should be no error
    should.not.exist(error);
  }
}
