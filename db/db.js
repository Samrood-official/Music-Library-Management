import { connect } from "mongoose";
const createConnection = (uri) => {
    const mongUrl= uri + '/musicLibrary'
    connect(mongUrl).then(() => {
        console.log("✅ Database connection successful");
    }).catch((err) => {
        console.log("❌ Database connection error", err);
    })
}

export default createConnection;
