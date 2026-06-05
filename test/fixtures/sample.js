// Sample file used by the KafkaCode test suite.
// The "secrets" below are intentionally fake / well-known example values.

const awsKey = "AKIAIOSFODNN7EXAMPLE";
const userEmail = "jane.doe@example.com";

function saveUser(user) {
    console.log("Saving user " + userEmail);
    return db.save(user);
}

module.exports = { saveUser };
