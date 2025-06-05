import mongoose from "mongoose"

const contactUsSchema = mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    mobileNo: {
        type: Number,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    message: {
        type: String,
        require: true
    }
})

export default mongoose.model("ContactUs", contactUsSchema)