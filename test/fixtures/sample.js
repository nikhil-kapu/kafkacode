// Sample file used by the KafkaCode test suite.
// The "secrets" below are intentionally fake / well-known example values.

const awsKey = "AKIA1234567890ABCDEF";
const userEmail = "jane.doe@example.com";

function saveUser(user) {
    console.log("Saving user " + userEmail);
    return db.save(user);
}

module.exports = { saveUser };
