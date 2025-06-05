import { ThrowError } from "../utils/ErrorUtils.js";
import AboutUsServices from "../services/aboutUsServices.js";

const aboutUsServices = new AboutUsServices()

//createAboutUs
export const createAboutUs = async (req, res) => {
    try {
        const { tittle, description } = req.body

        if (!tittle || !description) {
            return res.status(400).json({ message: "tittle ordescription must be required!!!" })
        }

        const savedata = await aboutUsServices.addNewAboutUs({
            tittle,
            description
        })

        return res.status(200).json({ message: "AboutUs created successfully...", data: savedata })

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
}

//getAboutUsById
export const getAboutUsById = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await aboutUsServices.getAboutusById(id)

        if (!data) {
            return ThrowError(res, 404, "Id not found");
        }

        return res.status(200).json({
            message: "user fetched successfully",
            data: data
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
};

//getAllUsers
export const getAllAboutUs = async (req, res) => {
    try {
        const data = await aboutUsServices.getAllAboutUs()

        if (!data) {
            return res.status(200).json({ message: "No any data found!!" })
        }

        return res.status(200).json({
            message: "data fetched successfully",
            data: data
        });

    } catch (error) {
        return ThrowError(res, 500, error.message)
    }
}

//updateAboutUs
export const updateAboutUs = async (req, res) => {
    try {
        const { title, description } = req.body;
        const updateData = { title, description };

        const updateAbout = await aboutUsServices.updateAboutUs(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!updateAbout) {
            return res.status(404).json({
                success: false,
                message: "About Us not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "About Us updated successfully",
            data: updateAbout
        });
    } catch (error) {
        return ThrowError(res, 500, error.message);
    }
}

//deleteAboutUs
export const deleteAboutUs = async (req, res) => {
    try {
        const deleteAboutUs = await aboutUsServices.deleteAboutUs(req.params.id);
        if (!deleteAboutUs) {
            res.status(404).json({
                success: false,
                message: "About Us not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "About Us deleted successfully",
        })
    } catch {
        return ThrowError(res, 500, error.message);
    }
}