import mongoose from "mongoose"

const aboutUsSchema = mongoose.Schema({
    tittle: {
        type: String
    },
    description: {
        type: String
    }
}, {
    timestamps: true
})

export default mongoose.model("AboutUs", aboutUsSchema)